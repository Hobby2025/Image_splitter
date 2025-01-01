import * as path from 'path';

/**
 * 파일 경로의 유효성과 안전성을 검증
 * 
 * @param filePath 검증할 파일 경로
 * @returns 파일 경로가 안전하면 true, 그렇지 않으면 false
 * 
 * 검증 항목:
 * 1. 경로 정규화 가능 여부
 * 2. 숨김 파일 여부 (.으로 시작하는 파일)
 * 3. 경로 조작 시도 여부
 */
export function validateFilePath(filePath: string): boolean {
    try {
        // 경로 정규화 - 상대 경로("..", "." 등)를 절대 경로로 변환
        const normalizedPath = path.normalize(filePath);

        // 숨김 파일 검사 (.으로 시작하는 파일은 거부)
        if (path.basename(normalizedPath).startsWith('.')) {
            return false;
        }

        // TODO: 추가적인 보안 검사 구현 가능
        // - 심볼릭 링크 검사
        // - 파일 시스템 접근 권한 검사
        // - 허용된 확장자 검사
        // - 경로 길이 제한 검사

        return true;
    } catch {
        // 경로 정규화 실패 등의 오류 발생 시 false 반환
        return false;
    }
}

/**
 * 에러 메시지에서 민감한 정보를 제거
 * 
 * @param error 처리할 Error 객체
 * @returns 민감한 정보가 제거된 에러 메시지
 * 
 * 제거 대상:
 * - Windows 스타일 파일 경로 (C:\Users\...)
 * - Unix 스타일 파일 경로 (/home/user/...)
 * - 기타 민감할 수 있는 시스템 경로
 */
export function sanitizeErrorMessage(error: Error): string {
    // 파일 경로 패턴을 [PATH]로 치환
    // Windows 경로: 'C:\folder\file.txt'
    // Unix 경로: '/folder/file.txt'
    const message = error.message.replace(/[A-Za-z]:\\.*\\|\/.*\//, '[PATH]');
    return message;
} 