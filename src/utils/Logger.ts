import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

/**
 * 애플리케이션의 로깅을 담당하는 유틸리티 클래스
 * 일반 로그와 에러 로그를 파일로 저장하고 콘솔에 출력
 */
export class Logger {
    private static logDir: string;    // 로그 파일이 저장될 디렉토리 경로
    private static logFile: string;   // 일반 로그 파일 경로
    private static errorFile: string; // 에러 로그 파일 경로

    /**
     * Logger 초기화: 로그 디렉토리 및 파일 설정
     * 앱의 사용자 데이터 디렉토리 내에 logs 폴더 생성
     */
    static initialize(): void {
        // 로그 디렉토리 설정 (앱의 사용자 데이터 디렉토리 내)
        this.logDir = path.join(app.getPath('userData'), 'logs');
        
        // 로그 파일명에 날짜 포함 (YYYY-MM-DD 형식)
        const date = new Date().toISOString().split('T')[0];
        this.logFile = path.join(this.logDir, `app-${date}.log`);
        this.errorFile = path.join(this.logDir, `error-${date}.log`);

        // 로그 디렉토리가 없으면 생성
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * 로그 파일에 메시지 작성
     * @param filePath 로그 파일 경로
     * @param message 기록할 메시지
     */
    private static writeLog(filePath: string, message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        fs.appendFileSync(filePath, logMessage);
    }

    /**
     * 에러 로그 기록
     * 콘솔과 에러 로그 파일에 기록
     * @param message 에러 메시지
     * @param error Error 객체 (선택적)
     */
    static error(message: string, error?: Error): void {
        const errorMessage = `[Error] ${message} ${error ? `\nStack: ${error.stack}` : ''}`;
        console.error(errorMessage);

        if (this.errorFile) {
            this.writeLog(this.errorFile, errorMessage);
        }
    }

    /**
     * 정보 로그 기록
     * 콘솔과 일반 로그 파일에 기록
     * @param message 정보 메시지
     */
    static info(message: string): void {
        const infoMessage = `[Info] ${message}`;
        console.info(infoMessage);

        if (this.logFile) {
            this.writeLog(this.logFile, infoMessage);
        }
    }

    /**
     * 디버그 로그 기록
     * 개발 환경에서만 기록됨
     * @param message 디버그 메시지
     */
    static debug(message: string): void {
        if (process.env.NODE_ENV === 'development') {
            const debugMessage = `[Debug] ${message}`;
            console.debug(debugMessage);

            if (this.logFile) {
                this.writeLog(this.logFile, debugMessage);
            }
        }
    }

    /**
     * 현재 로그 디렉토리 경로 반환
     * @returns 로그 디렉토리 경로
     */
    static getLogPath(): string {
        return this.logDir;
    }

    /**
     * 오래된 로그 파일 정리
     * 30일이 지난 로그 파일을 자동으로 삭제
     */
    static cleanOldLogs(): void {
        if (!this.logDir) return;

        const files = fs.readdirSync(this.logDir);
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30일을 밀리초로 변환

        files.forEach(file => {
            const filePath = path.join(this.logDir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
            }
        });
    }
} 