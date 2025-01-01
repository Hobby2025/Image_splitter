export interface AppState {
    selectedZipPath: string | null;
    selectedSavePath: string | null;
    isProcessing: boolean;
    splitHeight: number;
}

export interface ImageProcessingResult {
    success: boolean;
    message: string;
    progress?: number;
}

export interface ProcessingOptions {
    zipPath: string;
    splitHeight: number;
    outputDir: string;
    onProgress: (progress: number) => void;
}

export type NotificationType = 'error' | 'success' | 'info' | 'ready';

export interface ProcessingError extends Error {
    code?: string;
    details?: any;
}