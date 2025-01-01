const { ipcRenderer } = window.require('electron');
const path = window.require('path');

class ImageSplitterUI {
    private dropZone: HTMLDivElement;
    private status: HTMLDivElement;
    private selectButton: HTMLButtonElement;
    private savePathContainer: HTMLDivElement;
    private savePath: HTMLDivElement;
    private editSavePathButton: HTMLButtonElement;
    private initialDropState: HTMLDivElement;
    private selectedFileState: HTMLDivElement;
    private selectedFileName: HTMLDivElement;
    private cancelSelection: HTMLButtonElement;
    private completionStatus: HTMLDivElement;
    private logViewer: HTMLDivElement;
    private logContent: HTMLDivElement;

    private state: {
        selectedZipPath: string | null;
        selectedSavePath: string | null;
        isProcessing: boolean;
        splitHeight: number;
    };

    constructor() {
        console.log('ImageSplitterUI 초기화 시작');
        
        this.dropZone = document.getElementById('dropZone') as HTMLDivElement;
        this.status = document.getElementById('status') as HTMLDivElement;
        this.selectButton = document.getElementById('selectZip') as HTMLButtonElement;
        
        // 요소들이 제대로 찾아졌는지 확인
        console.log('주요 요소 확인:', {
            dropZone: !!this.dropZone,
            status: !!this.status,
            selectButton: !!this.selectButton
        });

        this.savePathContainer = document.getElementById('savePathContainer') as HTMLDivElement;
        this.savePath = document.getElementById('savePath') as HTMLDivElement;
        this.editSavePathButton = document.getElementById('editSavePath') as HTMLButtonElement;
        this.initialDropState = document.getElementById('initialDropState') as HTMLDivElement;
        this.selectedFileState = document.getElementById('selectedFileState') as HTMLDivElement;
        this.selectedFileName = document.getElementById('selectedFileName') as HTMLDivElement;
        this.cancelSelection = document.getElementById('cancelSelection') as HTMLButtonElement;
        this.completionStatus = document.getElementById('completionStatus') as HTMLDivElement;
        
        this.state = {
            selectedZipPath: null,
            selectedSavePath: null,
            isProcessing: false,
            splitHeight: 1500
        };
        
        this.initializeEventListeners();
        this.initializeMessageHandlers();
        
        // 초기 상태 메시지 설정
        this.updateStatus('ZIP 파일을 선택해주세요.');
        
        // 저장 경로 컨테이너 초기 표시
        this.savePathContainer.style.display = 'block';
        this.savePath.textContent = '저장 경로를 선택해주세요';
        
        // 로그 뷰어 요소
        this.logViewer = document.getElementById('logViewer') as HTMLDivElement;
        this.logContent = document.getElementById('logContent') as HTMLDivElement;
        
        // 로그 뷰어 이벤트 리스너 초기화
        this.initializeLogViewerEvents();

        // 앱 초기화 버튼 이벤트 리스너 추가
        document.getElementById('resetApp')!.addEventListener('click', () => {
            this.confirmAndResetApp();
        });

        // 다크모드 초기화
        this.initializeTheme();
    }

    private initializeEventListeners() {
        console.log('이벤트 리스너 초기화 시작');
        
        this.selectButton.addEventListener('click', () => {
            console.log('ZIP 파일 선택 버튼 클릭됨');
            this.selectZipFile();
        });
        
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('dragover');
            
            // dataTransfer가 null이 아닌지 확인
            if (!e.dataTransfer) return;
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].path.toLowerCase().endsWith('.zip')) {
                this.handleZipFile(files[0].path);
            } else {
                this.updateStatus('ZIP 파일만 지원됩니다.', 'error');
            }
        });

        // 경로 수정 버튼 클릭 이벤트
        this.editSavePathButton.addEventListener('click', async () => {
            console.log('저장 경로 수정 버튼 클릭됨');
            const saveResult = await ipcRenderer.invoke('select-save-directory');
            console.log('저장 경로 선택 결과:', saveResult);
            if (saveResult && saveResult.filePaths && saveResult.filePaths[0]) {
                this.state.selectedSavePath = saveResult.filePaths[0];
                this.savePath.textContent = this.state.selectedSavePath;
                this.updateStatusBasedOnState();
            }
        });

        // 이미지 처리 시작 버튼 클릭 이벤트
        const processButton = document.getElementById('processImages');
        console.log('처리 버튼 요소 확인:', !!processButton);
        
        processButton?.addEventListener('click', () => {
            console.log('이미지 처리 버튼 클릭됨');
            this.processImages();
        });

        // 파일 선택 취소 버튼 이벤트
        this.cancelSelection.addEventListener('click', () => {
            this.resetFileSelection();
        });
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
        // 진행률 표시 UI 업데이트
        const percent = Math.round(progress * 100);
        this.updateStatus(`처리 중... ${percent}%`, 'info');
    }

    private async selectZipFile() {
        const zipPath = await ipcRenderer.invoke('select-zip');
        if (zipPath) {
            this.handleZipFile(zipPath);
        }
    }

    private handleZipFile(zipPath: string) {
        this.state.selectedZipPath = zipPath;
        this.selectedFileName.textContent = path.basename(zipPath);
        
        this.initialDropState.classList.add('hidden');
        this.selectedFileState.classList.remove('hidden');
        
        this.updateStatusBasedOnState();
    }

    private resetFileSelection() {
        this.state.selectedZipPath = null;
        this.selectedFileName.textContent = '';
        
        this.initialDropState.classList.remove('hidden');
        this.selectedFileState.classList.add('hidden');
        
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

        this.status.textContent = message;
        
        const baseClasses = 'w-full max-w-3xl py-3 px-5 rounded-lg text-center text-lg transition-all duration-300';
        const typeClasses: { [key: string]: string } = {
            'error': 'bg-red-50 text-red-600 border border-red-200 dark:bg-gray-900 dark:text-white dark:border-red-800',
            'success': 'bg-green-50 text-green-600 border border-green-200 dark:bg-gray-900 dark:text-white dark:border-green-800',
            'info': 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-gray-900 dark:text-white dark:border-blue-800',
            'ready': 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-gray-900 dark:text-white dark:border-emerald-800'
        };
        
        this.status.className = `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
    }

    private showCompletionMessage(message: string) {
        // 완료 메시지 표시
        this.completionStatus.querySelector('div')!.textContent = message;
        this.completionStatus.classList.remove('translate-y-full');
        
        // 3초 후 메시지 숨기기
        setTimeout(() => {
            this.completionStatus.classList.add('translate-y-full');
        }, 3000);
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
        document.getElementById('showLogs')!.addEventListener('click', () => {
            this.logViewer.classList.remove('hidden');
            this.logViewer.classList.add('flex');
            this.loadLogs('app');  // 기본적으로 앱 로그 표시
        });

        // 로그 뷰어 닫기
        document.getElementById('closeLogViewer')!.addEventListener('click', () => {
            this.logViewer.classList.add('hidden');
            this.logViewer.classList.remove('flex');
        });

        // 앱 로그 보기
        document.getElementById('showAppLogs')!.addEventListener('click', () => {
            this.loadLogs('app');
        });

        // 에러 로그 보기
        document.getElementById('showErrorLogs')!.addEventListener('click', () => {
            this.loadLogs('error');
        });

        // 로그 디렉토리 열기
        document.getElementById('openLogDir')!.addEventListener('click', () => {
            ipcRenderer.invoke('open-log-dir');
        });

        // 모달 외부 클릭 시 닫기
        this.logViewer.addEventListener('click', (e) => {
            if (e.target === this.logViewer) {
                this.logViewer.classList.add('hidden');
                this.logViewer.classList.remove('flex');
            }
        });
    }

    private async loadLogs(type: string) {
        try {
            const logs = await ipcRenderer.invoke('get-logs', type);
            const formattedLogs = this.formatLogs(logs, type);
            this.logContent.innerHTML = formattedLogs;
            this.logContent.scrollTop = this.logContent.scrollHeight;
        } catch (error) {
            this.logContent.innerHTML = '<div class="text-red-600">로그를 불러올 수 없습니다.</div>';
        }
    }

    private formatLogs(logs: string, type: string) {
        if (!logs || logs === '로그가 없습니다.') {
            return `<div class="text-secondary-500 text-center py-4">기록된 ${type === 'error' ? '오류' : '작업'} 로그가 없습니다.</div>`;
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
                    levelClass = 'text-red-600 bg-red-50 border-red-200 dark:bg-gray-900 dark:text-white dark:border-red-800';
                    break;
                case 'Info':
                    levelClass = 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-gray-900 dark:text-white dark:border-blue-800';
                    break;
                case 'Debug':
                    levelClass = 'text-green-600 bg-green-50 border-green-200 dark:bg-gray-900 dark:text-white dark:border-green-800';
                    break;
                default:
                    levelClass = 'text-secondary-600 bg-secondary-50 border-secondary-200 dark:bg-gray-900 dark:text-white dark:border-gray-700';
            }

            return `
                <div class="mb-2 rounded-lg border p-2 ${levelClass}">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="font-medium">${level || '정보'}</span>
                        <span class="text-secondary-500 dark:text-secondary-400">${this.formatTimestamp(timestamp)}</span>
                    </div>
                    <div class="text-sm whitespace-pre-wrap">${this.escapeHtml(message)}</div>
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
                this.savePath.textContent = '저장 경로를 선택해주세요';
                
                // 로그 뷰어 닫기
                this.logViewer.classList.add('hidden');
                this.logViewer.classList.remove('flex');

                // 상태 메시지 업데이트
                this.updateStatus('앱이 초기화되었습니다.', 'info');

                // 설정 저장
                await ipcRenderer.invoke('reset-app-settings');

                // 성공 효과
                this.pulseSuccess();
            } catch (error) {
                this.updateStatus('초기화 중 오류가 발생했습니다.', 'error');
                this.shakeWindow();
                console.error('App reset failed', error);
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
}

new ImageSplitterUI(); 