import { ProcessingOptions, ImageProcessingResult } from '../types';
import { Logger } from '../utils/Logger';
import { validateFilePath } from '../utils/SecurityUtils';
import * as fs from 'fs';
import StreamZip from 'node-stream-zip';
import * as path from 'path';
import sharp from 'sharp';

export class FileService {
    private readonly MAX_CONCURRENT_PROCESSES = 3;
    private processing = false;
    private cancelRequested = false;

    /**
     * 이미지 처리 메인 함수
     * @param options 이미지 처리 옵션 (zipPath, splitHeight, outputDir, onProgress)
     * @returns 처리 결과 객체
     */
    async processImages(options: ProcessingOptions): Promise<ImageProcessingResult> {
        if (!validateFilePath(options.zipPath) || !validateFilePath(options.outputDir)) {
            throw new Error('유효하지 않은 파일 경로입니다.');
        }

        if (this.processing) {
            throw new Error('이미 처리 중인 작업이 있습니다.');
        }

        this.processing = true;
        this.cancelRequested = false;
        let zip: InstanceType<typeof StreamZip.async> | null = null;

        try {
            zip = new StreamZip.async({ file: options.zipPath });
            const entries = await zip.entries();
            const imageFiles: { entryName: string, folderPath: string }[] = [];

            // ZIP 파일 내의 이미지 파일만 필터링
            for (const [entryName, entry] of Object.entries(entries)) {
                if (entryName.includes('__MACOSX')) continue;
                if (!entry.isDirectory && /\.(jpe?g|png|webp|tiff|gif|svg)$/i.test(entryName)) {
                    const normalizedPath = entryName.replace(/\\/g, '/');
                    const folderPath = path.dirname(normalizedPath);
                    imageFiles.push({ entryName, folderPath });
                }
            }

            imageFiles.sort((a, b) => a.entryName.localeCompare(b.entryName));

            const zipFolderName = path.basename(options.zipPath, path.extname(options.zipPath));
            const baseOutputDir = path.join(options.outputDir, zipFolderName);
            fs.mkdirSync(baseOutputDir, { recursive: true });

            const folderIndices = new Map<string, number>();
            const totalFiles = imageFiles.length;
            let processedFiles = 0;

            // 각 이미지 순차 처리
            for (const { entryName, folderPath } of imageFiles) {
                if (this.cancelRequested) {
                    throw new Error('작업이 취소되었습니다.');
                }

                try {
                    const imageBuffer = await zip.entryData(entryName);
                    if (!imageBuffer) {
                        Logger.error(`이미지 파일을 읽을 수 없습니다: ${entryName}`);
                        continue;
                    }

                    const metadata = await sharp(imageBuffer).metadata();
                    if (!metadata.width || !metadata.height) {
                        Logger.error(`이미지 메타데이터를 읽을 수 없습니다: ${entryName}`);
                        continue;
                    }

                    const originalHeight = metadata.height;
                    const originalWidth = metadata.width;
                    const outputDir = path.join(baseOutputDir, folderPath);
                    fs.mkdirSync(outputDir, { recursive: true });

                    const imageIndex = folderIndices.get(folderPath) || 1;

                    if (originalHeight < options.splitHeight * 1.2) {
                        // 작은 이미지는 그대로 저장
                        const outputFilePath = path.join(
                            outputDir,
                            `${String(imageIndex).padStart(3, '0')}.jpg`
                        );
                        await sharp(imageBuffer).toFile(outputFilePath);
                        Logger.info(`이미지 저장 완료: ${outputFilePath}`);
                        folderIndices.set(folderPath, imageIndex + 1);
                    } else {
                        // 큰 이미지는 분할하여 저장
                        const parts = Math.ceil(originalHeight / options.splitHeight);
                        let currentIndex = imageIndex;

                        for (let j = 0; j < parts; j++) {
                            if (this.cancelRequested) break;

                            const height = Math.min(
                                options.splitHeight,
                                originalHeight - j * options.splitHeight
                            );
                            if (height <= 0) break;

                            const outputFilePath = path.join(
                                outputDir,
                                `${String(currentIndex).padStart(3, '0')}.jpg`
                            );

                            await sharp(imageBuffer)
                                .extract({
                                    left: 0,
                                    top: j * options.splitHeight,
                                    width: originalWidth,
                                    height
                                })
                                .toFile(outputFilePath);

                            Logger.info(`이미지 조각 저장 완료: ${outputFilePath}`);
                            currentIndex++;
                        }
                        folderIndices.set(folderPath, currentIndex);
                    }

                    processedFiles++;
                    options.onProgress?.((processedFiles / totalFiles) * 100);

                } catch (error) {
                    Logger.error(`이미지 처리 중 오류 발생: ${entryName}`, error as Error);
                }
            }

            return {
                success: true,
                message: '이미지 처리가 완료되었습니다.'
            };

        } catch (error) {
            Logger.error('이미지 처리 중 오류가 발생했습니다.', error as Error);
            throw error;
        } finally {
            if (zip) {
                await zip.close();
            }
            this.processing = false;
            this.cancelRequested = false;
        }
    }

    /**
     * 현재 실행 중인 이미지 처리 작업을 취소
     */
    cancelProcessing(): void {
        this.cancelRequested = true;
    }
}

class Semaphore {
    private permits: number;
    private tasks: (() => void)[] = [];

    constructor(permits: number) {
        this.permits = permits;
    }

    async acquire(): Promise<void> {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.tasks.push(resolve);
        });
    }

    release(): void {
        if (this.tasks.length > 0) {
            const task = this.tasks.shift();
            task?.();
        } else {
            this.permits++;
        }
    }
} 