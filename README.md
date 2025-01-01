# Image Splitter

긴 이미지를 일정 높이로 자동 분할해주는 프로그램입니다.

## 주요 기능

- ZIP 파일 내의 이미지들을 자동으로 분할
- 드래그 앤 드롭으로 간편한 파일 선택
- 분할 높이 커스터마이징
- 다크모드 지원
- 처리 진행률 표시
- 로그 확인 기능

## 설치 방법

### 개발 환경 설정

1. 저장소 클론:
```
bash
git clone https://github.com/Hobby2025/image_splitter.git
cd image_splitter
```

2. 의존성 설치:
```
bash
npm install
```

### 개발 모드 실행

- Windows:
```
bash
npm run start:win
```

- macOS:
```
bash
npm run start:mac
```

## 빌드 및 배포

### Windows 배포판 생성
```
bash
npm run dist:win
```

### macOS 배포판 생성
```
bash
npm run dist:mac
```

빌드된 실행 파일은 `release` 폴더에서 찾을 수 있습니다.

## 사용 방법

1. 프로그램 실행
2. ZIP 파일을 드래그 앤 드롭하거나 '파일 선택' 버튼으로 선택
3. 분할 높이 설정 (기본값: 1500px)
4. 저장 경로 선택
5. '이미지 처리 시작' 버튼 클릭

## 시스템 요구사항

- Windows 10 이상 또는 macOS 10.13 이상
- 최소 4GB RAM
- 500MB 이상의 여유 디스크 공간

## 개발 환경

- Node.js 18.x 이상
- npm 9.x 이상
- Electron 24.x
- TypeScript 5.x

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.