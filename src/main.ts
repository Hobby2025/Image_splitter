import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import AdmZip from 'adm-zip';
import { ImageProcessingResult, ProcessingOptions } from './types';
import { FileService } from './services/FileService';
import { Logger } from './utils/Logger';

// sharp 모듈 설정
import type { Sharp, Metadata } from 'sharp';
const sharp = require('sharp');
sharp.cache(false);

/**
 * 이미지 스플리터 애플리케이션의 메인 클래스
 * Electron 애플리케이션의 생명주기와 주요 기능을 관리
 */
class ImageSplitterApp {
    private mainWindow: BrowserWindow | null = null;
    private fileService: FileService;

    constructor() {
        Logger.initialize();  // 로깅 시스템 초기화
        this.fileService = new FileService(); // FileService 인스턴스 생성
        this.initializeApp();
    }

    /**
     * 애플리케이션 초기화 및 기본 설정
     */
    private initializeApp(): void {
        Logger.info('Application starting...');

        app.whenReady().then(() => {
            if (process.platform === 'win32') {
                app.setAppUserModelId('Image Splitter');
            }
            this.createWindow();
            this.setupAppEvents();
            this.setupIpcHandlers();
        });
    }

    /**
     * 메인 윈도우 생성 및 설정
     */
    private createWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            icon: path.join(__dirname, '../build/icons/icon.png'),
            title: 'Image Splitter'
        });

        this.mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
    }

    /**
     * 애플리케이션 이벤트 핸들러 설정
     */
    private setupAppEvents(): void {
        // macOS를 제외한 모든 창이 닫힐 때 앱 종료
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        // macOS에서 dock 아이콘 클릭 시 창 생성
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });

        // 앱 종료 시 로그 정리
        app.on('quit', () => {
            Logger.cleanOldLogs();
        });
    }

    /**
     * IPC(Inter-Process Communication) 이벤트 핸들러 설정
     */
    private setupIpcHandlers(): void {
        // ZIP 파일 선택
        ipcMain.handle('select-zip', this.handleSelectZip.bind(this));
        
        // 저장 디렉토리 선택
        ipcMain.handle('select-save-directory', this.handleSelectSaveDirectory.bind(this));
        
        // ZIP 파일 처리
        ipcMain.handle('process-zip', async (event, zipPath: string, splitHeight: number, outputDir: string) => {
            const options: ProcessingOptions = {
                zipPath,
                splitHeight,
                outputDir,
                onProgress: (progress) => {
                    event.sender.send('processing-progress', progress);
                }
            };

            return await this.fileService.processImages(options);
        });

        // ZIP 파일 유효성 검사
        ipcMain.handle('validate-zip', async (_, zipPath: string) => {
            try {
                const zip = new AdmZip(zipPath);
                return zip.getEntries().length > 0;
            } catch (error) {
                Logger.error('ZIP validation failed', error as Error);
                return false;
            }
        });

        // 독 아이콘 업데이트 핸들러
        ipcMain.on('update-dock', (_, type: string) => {
            if (process.platform === 'darwin') {
                switch (type) {
                    case 'progress':
                        app.dock.setBadge('⋯');
                        break;
                    case 'success':
                        app.dock.setBadge('✓');
                        break;
                    case 'error':
                        app.dock.setBadge('!');
                        break;
                    default:
                        app.dock.setBadge('');
                }
            } else if (process.platform === 'win32') {
                const win = BrowserWindow.getAllWindows()[0];
                switch (type) {
                    case 'progress':
                        win.setProgressBar(2);
                        break;
                    case 'success':
                        win.setProgressBar(-1);
                        win.flashFrame(true);
                        setTimeout(() => win.flashFrame(false), 500);
                        break;
                    case 'error':
                        win.setProgressBar(-1);
                        win.flashFrame(true);
                        setTimeout(() => win.flashFrame(false), 500);
                        break;
                    default:
                        win.setProgressBar(-1);
                }
            }
        });

        // 로그 조회 핸들러
        ipcMain.handle('get-logs', async (_, type: 'app' | 'error') => {
            try {
                const logPath = Logger.getLogPath();
                const date = new Date().toISOString().split('T')[0];
                const fileName = type === 'error' ? `error-${date}.log` : `app-${date}.log`;
                const filePath = path.join(logPath, fileName);

                if (fs.existsSync(filePath)) {
                    return fs.readFileSync(filePath, 'utf8');
                }
                return '로그가 없습니다.';
            } catch (error) {
                Logger.error('로그 파일 읽기 실패', error as Error);
                return '로그를 불러올 수 없습니다.';
            }
        });

        // 로그 파일 열기 핸들러
        ipcMain.handle('open-log-dir', () => {
            const logPath = Logger.getLogPath();
            shell.openPath(logPath);
        });

        // 앱 설정 초기화 핸들러
        ipcMain.handle('reset-app-settings', async () => {
            try {
                Logger.info('Resetting app settings...');
                // 여기에 설정 파일 초기화 등의 로직 추가 가능
                return true;
            } catch (error) {
                Logger.error('Failed to reset app settings', error as Error);
                throw error;
            }
        });
    }

    /**
     * ZIP 파일 선택 다이얼로그 표시
     */
    private async handleSelectZip(): Promise<string> {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'ZIP 파일', extensions: ['zip'] }]
        });
        return result.filePaths[0];
    }

    /**
     * 저장 폴더 선택 다이얼로그 표시
     */
    private async handleSelectSaveDirectory(): Promise<{ filePaths: string[] }> {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: '결과물을 저장할 폴더를 선택하세요'
        });
        return { filePaths: result.filePaths };
    }

    /**
     * 디렉토리 존재 확인 및 생성
     */
    private ensureDirectory(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

// 애플리케이션 인스턴스 생성
new ImageSplitterApp();