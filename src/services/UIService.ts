import { NotificationType } from '../types';

/**
 * UI 관련 기능을 처리하는 싱글톤 서비스 클래스
 * 메인 프로세스와 렌더러 프로세스 간의 UI 관련 통신을 담당
 */
export class UIService {
    private static instance: UIService;
    
    /**
     * UIService의 싱글톤 인스턴스를 반환
     * @returns UIService 인스턴스
     */
    static getInstance(): UIService {
        if (!UIService.instance) {
            UIService.instance = new UIService();
        }
        return UIService.instance;
    }

    /**
     * 사용자에게 알림 메시지를 표시
     * @param message 표시할 알림 메시지
     * @param type 알림 타입 (success, error, warning, info)
     */
    showNotification(message: string, type: NotificationType): void {
        window.postMessage(
            { 
                type: 'notification', 
                message, 
                notificationType: type 
            }, 
            '*'
        );
    }

    /**
     * 작업 진행률을 UI에 업데이트
     * @param progress 진행률 (0-100)
     */
    updateProgress(progress: number): void {
        window.postMessage(
            { 
                type: 'progress', 
                progress 
            }, 
            '*'
        );
    }
} 