import { ipcRenderer } from 'electron';
import * as path from 'path';

interface FileWithPath extends File {
    path: string;
}

class ImageSplitterUI {
    private dropZone: HTMLDivElement | null = null;
    private status: HTMLDivElement | null = null;
    private selectButton: HTMLButtonElement | null = null;
    private savePathContainer: HTMLDivElement | null = null;
    private savePath: HTMLDivElement | null = null;
    private editSavePathButton: HTMLButtonElement | null = null;
    private initialDropState: HTMLDivElement | null = null;
    private selectedFileState: HTMLDivElement | null = null;
    private selectedFileName: HTMLDivElement | null = null;
    private cancelSelection: HTMLButtonElement | null = null;
    private completionStatus: HTMLDivElement | null = null;
    private logViewer: HTMLDivElement | null = null;
    private logContent: HTMLDivElement | null = null;
    private appVersion: HTMLSpanElement | null = null;

    private state: {
        selectedZipPath: string | null;
        selectedSavePath: string | null;
        isProcessing: boolean;
        splitHeight: number;
    } = {
        selectedZipPath: null,
        selectedSavePath: null,
        isProcessing: false,
        splitHeight: 1500
    };

    constructor() {
        this.dropZone = document.getElementById('dropZone') as HTMLDivElement;
        this.status = document.getElementById('status') as HTMLDivElement;
        this.selectButton = document.getElementById('selectZip') as HTMLButtonElement;
        if (!this.selectButton) {
            return;
        }

        this.savePathContainer = document.getElementById('savePathContainer') as HTMLDivElement;
        this.savePath = document.getElementById('savePath') as HTMLDivElement;
        this.editSavePathButton = document.getElementById('editSavePath') as HTMLButtonElement;
        this.initialDropState = document.getElementById('initialDropState') as HTMLDivElement;
        this.selectedFileState = document.getElementById('selectedFileState') as HTMLDivElement;
        this.selectedFileName = document.getElementById('selectedFileName') as HTMLDivElement;
        this.cancelSelection = document.getElementById('cancelSelection') as HTMLButtonElement;
        this.completionStatus = document.getElementById('completionStatus') as HTMLDivElement;
        this.appVersion = document.getElementById('appVersion') as HTMLSpanElement;
        
        this.initializeEventListeners();
        this.initializeMessageHandlers();
        this.initializeAppVersion();
        
        // 초기 상태 메시지 설정
        this.updateStatus('ZIP 파일을 선택해주세요.');
        
        // 저장 경로 컨테이너 초기 표시
        if (this.savePathContainer) {
            this.savePathContainer.style.display = 'block';
        }
        if (this.savePath) {
            this.savePath.textContent = '저장 경로를 선택해주세요';
        }
        
        // 로그 뷰어 요소
        this.logViewer = document.getElementById('logViewer') as HTMLDivElement;
        this.logContent = document.getElementById('logContent') as HTMLDivElement;
        
        // 로그 뷰어 이벤트 리스너 초기화
        this.initializeLogViewerEvents();

        // 앱 초기화 버튼 이벤트 리스너 추가
        const resetAppButton = document.getElementById('resetApp');
        if (resetAppButton) {
            resetAppButton.addEventListener('click', () => {
                this.confirmAndResetApp();
            });
        }

        // 다크모드 초기화
        this.initializeTheme();
    }

    private initializeEventListeners() {
        if (this.selectButton) {
            this.selectButton.addEventListener('click', () => {
                this.selectZipFile();
            });
        }
        
        if (this.dropZone) {
            this.dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropZone?.classList.add('dragover');
            });

            this.dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropZone?.classList.remove('dragover');
            });

            this.dropZone.addEventListener('drop', (e) => {
                this.handleDrop(e);
            });
        }

        if (this.editSavePathButton) {
            this.editSavePathButton.addEventListener('click', async () => {
                const saveResult = await ipcRenderer.invoke('select-save-directory');
                if (saveResult && saveResult.filePaths && saveResult.filePaths[0]) {
                    this.state.selectedSavePath = saveResult.filePaths[0];
                    if (this.savePath) {
                        this.savePath.textContent = this.state.selectedSavePath;
                    }
                    this.updateStatusBasedOnState();
                }
            });
        }

        const processButton = document.getElementById('processImages');
        processButton?.addEventListener('click', () => {
            this.processImages();
        });

        if (this.cancelSelection) {
            this.cancelSelection.addEventListener('click', () => {
                this.resetFileSelection();
            });
        }
    }

    private initializeMessageHandlers() {
        window.addEventListener('message', (event) => {
            const { type, message, notificationType, progress } = event.data;
            
            switch (type) {
                case 'notification':
                    this.updateStatus(message, notificationType);
                    break;
                case 'progress':
                    this.updateProgress(progress);
                    break;
            }
        });
    }

    private updateProgress(progress: number) {
        const percent = Math.round(progress * 100);
        this.updateStatus(`처리 중... ${percent}%`, 'info');
    }

    private async selectZipFile() {
        try {
            const zipPath = await ipcRenderer.invoke('select-zip');
            if (zipPath) {
                this.handleZipFile(zipPath);
            }
        } catch (error) {
            this.updateStatus('ZIP 파일 선택 중 오류가 발생했습니다.', 'error');
        }
    }

    private handleZipFile(zipPath: string) {
        if (!zipPath) {
            this.updateStatus('유효하지 않은 ZIP 파일입니다.', 'error');
            return;
        }
        this.state.selectedZipPath = zipPath;
        
        if (this.selectedFileName) {
            this.selectedFileName.textContent = path.basename(zipPath);
        }
        
        if (this.initialDropState) {
            this.initialDropState.classList.add('hidden');
        }
        
        if (this.selectedFileState) {
            this.selectedFileState.classList.remove('hidden');
        }
        
        this.updateStatusBasedOnState();
    }

    private resetFileSelection() {
        this.state.selectedZipPath = null;
        
        if (this.selectedFileName) {
            this.selectedFileName.textContent = '';
        }
        
        if (this.initialDropState) {
            this.initialDropState.classList.remove('hidden');
        }
        
        if (this.selectedFileState) {
            this.selectedFileState.classList.add('hidden');
        }
        
        this.updateStatusBasedOnState();
    }

    private updateStatusBasedOnState() {
        if (!this.state.selectedZipPath && !this.state.selectedSavePath) {
            this.updateStatus('ZIP 파일을 선택해주세요.', 'info');
        } else if (!this.state.selectedZipPath && this.state.selectedSavePath) {
            this.updateStatus('ZIP 파일을 선택해주세요.', 'info');
        } else if (this.state.selectedZipPath && !this.state.selectedSavePath) {
            this.updateStatus('저장 경로를 선택해주세요.', 'info');
        } else {
            this.updateStatus('이미지 처리 버튼을 눌러 처리를 시작하세요.', 'ready');
        }
    }

    private updateStatus(message: string, type: string = 'info') {
        if (type === 'success' && message.includes('완료')) {
            this.showCompletionMessage(message);
        }

        if (this.status) {
            this.status.textContent = message;
            this.status.className = `status-message ${type}`;
        }
    }

    private showCompletionMessage(message: string) {
        if (this.completionStatus) {
            const div = this.completionStatus.querySelector('div');
            if (div) {
                div.textContent = message;
            }
            this.completionStatus.classList.remove('translate-y-full');
            setTimeout(() => {
                if (this.completionStatus) {
                    this.completionStatus.classList.add('translate-y-full');
                }
            }, 3000);
        }
    }

    // 창 흔들기 효과
    private shakeWindow() {
        const positions = [
            'translateX(0px)',
            'translateX(-10px)',
            'translateX(10px)',
            'translateX(-5px)',
            'translateX(5px)',
            'translateX(0px)'
        ];
        let time = 0;
        positions.forEach((pos, i) => {
            setTimeout(() => {
                document.body.style.transform = pos;
            }, time);
            time += 50;
        });
        setTimeout(() => {
            document.body.style.transform = 'none';
        }, time);
    }

    // 성공 효과
    private pulseSuccess() {
        document.body.classList.add('success-pulse');
        setTimeout(() => {
            document.body.classList.remove('success-pulse');
        }, 1000);
    }

    // 앱 아이콘 상태 업데이트
    private updateDockIcon(type: string) {
        ipcRenderer.send('update-dock', type);
    }

    private async processImages() {
        if (this.state.isProcessing) return;

        try {
            this.state.isProcessing = true;
            document.body.classList.add('processing');
            this.updateDockIcon('progress');
            this.updateStatus('이미지 처리를 시작합니다...', 'info');

            // 파일 유효성 검사
            const isValid = await ipcRenderer.invoke('validate-zip', this.state.selectedZipPath);
            if (!isValid) {
                throw new Error('유효하지 않은 ZIP 파일입니다.');
            }

            const result = await ipcRenderer.invoke('process-zip', 
                this.state.selectedZipPath,
                this.state.splitHeight,
                this.state.selectedSavePath
            );

            if (result.success) {
                this.updateStatus(result.message, 'success');
                this.pulseSuccess();
                this.updateDockIcon('success');
                this.resetFileSelection();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.updateStatus((error as Error).message, 'error');
            this.shakeWindow();
            this.updateDockIcon('error');
        } finally {
            this.state.isProcessing = false;
            document.body.classList.remove('processing');
            setTimeout(() => {
                this.updateDockIcon('normal');
            }, 3000);
        }
    }

    private initializeLogViewerEvents() {
        // 로그 뷰어 열기
        const showLogsButton = document.getElementById('showLogs');
        if (showLogsButton && this.logViewer) {
            showLogsButton.addEventListener('click', () => {
                if (this.logViewer) {
                    this.logViewer.style.display = 'block';
                    this.loadLogs('app');
                }
            });
        }

        // 로그 뷰어 닫기
        const closeLogViewerButton = document.getElementById('closeLogViewer');
        if (closeLogViewerButton && this.logViewer) {
            closeLogViewerButton.addEventListener('click', () => {
                if (this.logViewer) {
                    this.logViewer.style.display = 'none';
                }
            });
        }

        // 앱 로그 보기
        const showAppLogsButton = document.getElementById('showAppLogs');
        if (showAppLogsButton) {
            showAppLogsButton.addEventListener('click', () => {
                this.loadLogs('app');
            });
        }

        // 에러 로그 보기
        const showErrorLogsButton = document.getElementById('showErrorLogs');
        if (showErrorLogsButton) {
            showErrorLogsButton.addEventListener('click', () => {
                this.loadLogs('error');
            });
        }

        // 로그 디렉토리 열기
        const openLogDirButton = document.getElementById('openLogDir');
        if (openLogDirButton) {
            openLogDirButton.addEventListener('click', () => {
                ipcRenderer.invoke('open-log-dir');
            });
        }

        // 모달 외부 클릭 시 닫기
        if (this.logViewer) {
            this.logViewer.addEventListener('click', (e) => {
                if (e.target === this.logViewer && this.logViewer) {
                    this.logViewer.style.display = 'none';
                }
            });
        }
    }

    private async loadLogs(type: string) {
        try {
            console.log('로그 로딩 시작:', type);  // 디버깅용 로그
            const logs = await ipcRenderer.invoke('get-logs', type);
            console.log('로그 데이터 수신:', logs ? '데이터 있음' : '데이터 없음');  // 디버깅용 로그
            const formattedLogs = this.formatLogs(logs, type);
            if (this.logContent) {
                this.logContent.innerHTML = formattedLogs;
                this.logContent.scrollTop = this.logContent.scrollHeight;
            }
        } catch (error) {
            console.error('로그 로딩 오류:', error);  // 디버깅용 로그
            if (this.logContent) {
                this.logContent.innerHTML = '<div class="log-item text-red-600 text-center py-4">로그를 불러올 수 없습니다.</div>';
            }
        }
    }

    private formatLogs(logs: string, type: string) {
        if (!logs || logs === '로그가 없습니다.') {
            return `<div class="log-item text-secondary-500 text-center py-4">기록된 ${type === 'error' ? '오류' : '작업'} 로그가 없습니다.</div>`;
        }

        return logs.split('\n').map(line => {
            if (!line.trim()) return '';
            
            // 타임스탬프 추출
            const timestampMatch = line.match(/\[(.*?)\]/);
            const timestamp = timestampMatch ? timestampMatch[1] : '';
            
            // 로그 레벨과 메시지 분리
            const levelMatch = line.match(/\[(Error|Info|Debug)\]/);
            const level = levelMatch ? levelMatch[1] : '';
            
            // 메시지 추출
            const message = line.replace(/\[.*?\]\s*/g, '').trim();

            // 로그 레벨에 따른 스타일 적용
            let levelClass = '';
            switch (level) {
                case 'Error':
                    levelClass = 'text-red-600 dark:text-red-400';
                    break;
                case 'Info':
                    levelClass = 'text-blue-600 dark:text-blue-400';
                    break;
                case 'Debug':
                    levelClass = 'text-green-600 dark:text-green-400';
                    break;
                default:
                    levelClass = 'text-secondary-600 dark:text-secondary-400';
            }

            return `
                <div class="log-item">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="font-medium ${levelClass}">${level || '정보'}</span>
                        <span class="text-secondary-500 dark:text-secondary-400">${this.formatTimestamp(timestamp)}</span>
                    </div>
                    <div class="whitespace-pre-wrap">${this.escapeHtml(message)}</div>
                </div>
            `;
        }).join('');
    }

    private formatTimestamp(timestamp: string) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }

    private escapeHtml(text: string) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 앱 초기화 확인 및 실행
    private async confirmAndResetApp() {
        // 처리 중인 경우 초기화 방지
        if (this.state.isProcessing) {
            this.updateStatus('처리 중에는 초기화할 수 없습니다.', 'error');
            this.shakeWindow();
            return;
        }

        // 확인 모달 표시
        const shouldReset = confirm('앱을 초기화하시겠습니까?\n\n모든 설정이 기본값으로 돌아가며, 현재 작업이 취소됩니다.');
        
        if (shouldReset) {
            try {
                // 상태 초기화
                this.state = {
                    selectedZipPath: null,
                    selectedSavePath: null,
                    isProcessing: false,
                    splitHeight: 1500
                };

                // UI 초기화
                this.resetFileSelection();
                (document.getElementById('splitHeight') as HTMLInputElement).value = '1500';
                if (this.savePath) {
                    this.savePath.textContent = '저장 경로를 선택해주세요';
                }
                
                // 로그 뷰어 닫기
                if (this.logViewer) {
                    this.logViewer.classList.add('hidden');
                    this.logViewer.classList.remove('flex');
                }

                // 상태 메시지 업데이트
                this.updateStatus('앱이 초기화되었습니다.', 'info');

                // 설정 저장
                await ipcRenderer.invoke('reset-app-settings');

                // 성공 효과
                this.pulseSuccess();
            } catch (error) {
                this.updateStatus('초기화 중 오류가 발생했습니다.', 'error');
                this.shakeWindow();
            }
        }
    }

    private initializeTheme() {
        // 시스템 다크모드 감지
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 저장된 테마 설정 불러오기
        const savedTheme = localStorage.getItem('theme');
        
        // 테마 초기 설정 (기본값은 라이트모드)
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light');
        }
        
        // 테마 토글 버튼 이벤트
        document.getElementById('toggleTheme')!.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // 시스템 테마 변경 감지
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {  // 수동 설정이 없을 때만
                this.setTheme('light');  // 항상 라이트모드 유지
            }
        });
    }

    private setTheme(theme: string) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    private toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // 토글 효과
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files) {
            const file = files[0] as FileWithPath;
            if (file && file.path.toLowerCase().endsWith('.zip')) {
                this.handleZipFile(file.path);
            }
        }
    }

    private async initializeAppVersion() {
        try {
            const version = await ipcRenderer.invoke('get-app-version');
            if (this.appVersion) {
                this.appVersion.textContent = `v${version}`;
            }
            document.title = `Image Splitter v${version}`;
        } catch (error) {
            if (this.appVersion) {
                this.appVersion.textContent = '';
            }
        }
    }
}

new ImageSplitterUI(); 