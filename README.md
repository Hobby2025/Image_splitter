![License](https://img.shields.io/badge/License-MIT-black)&nbsp;
![Electron](https://img.shields.io/badge/Electron-2d2d2f?style=flat&logo=electron&logoColor=fff)&nbsp;
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC?style=flat&logo=typescript&logoColor=fff)&nbsp;
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC?style=flat&logo=tailwind-css&logoColor=fff)&nbsp;

![Image Splitter](https://github.com/user-attachments/assets/29212479-9284-46c1-a052-3c0c2c91b283)
   
긴 이미지를 일정 높이로 자동 분할해주는 프로그램입니다.

## 주요 기능

- ZIP 파일 내의 이미지들을 자동으로 분할
- 드래그 앤 드롭으로 간편한 파일 선택
- 분할 높이 커스터마이징 (기본값: 1500px)
- 다크모드/라이트모드 지원
- 실시간 처리 진행률 표시
- 상세 로그 확인 기능
- 자동 폰트 다운로드 (RIDI Batang)
- 윈도우/맥 크로스 플랫폼 지원

## 설치 방법

### 개발 환경 설정

1. 저장소 클론:
```bash
git clone https://github.com/Hobby2025/image_splitter.git
cd image_splitter
```

2. 의존성 설치:
```bash
npm install
# 이 과정에서 자동으로 다음 작업이 수행됩니다:
# - electron-builder 의존성 설치
# - TypeScript 빌드
# - 필요한 폰트 다운로드
```

### 개발 모드 실행

```bash
# 공통 실행 명령어
npm start

# Windows
npm run start:win  # Windows 전용 빌드 후 실행

# macOS
npm run start:mac  # macOS 전용 빌드 후 실행
```

### 개발 중 파일 감시
```bash
# TypeScript 파일 변경 감지
npm run watch

# CSS 파일 변경 감지
npm run watch:css
```

## 빌드 및 배포

### 빌드
```bash
# 전체 빌드
npm run build:all  # clean:dist + build + rebuild:platform

# TypeScript 빌드
npm run build
```

### Windows 배포판 생성
```bash
# 개발용 패키징
npm run pack:win

# 배포용 인스톨러 생성
npm run dist:win
```

### macOS 배포판 생성
```bash
# 개발용 패키징
npm run pack:mac

# 배포용 DMG 생성
npm run dist:mac
```

빌드된 실행 파일은 `release` 폴더에서 찾을 수 있습니다.

### 클린업
```bash
# dist 폴더 정리
npm run clean:dist

# 전체 클린업 (node_modules, release, package-lock.json, dist)
npm run clean
```

## 사용 방법

1. 프로그램 실행
2. ZIP 파일을 드래그 앤 드롭하거나 '파일 선택' 버튼으로 선택
3. 분할 높이 설정 (기본값: 1500px)
4. 저장 경로 선택
5. '이미지 처리 시작' 버튼 클릭

### 추가 기능
- 우측 상단의 '이미지 처리 시작' 버튼으로 처리 시작
- 좌측 상단의 테마 토글 버튼으로 다크모드/라이트모드 전환
- 로그 아이콘으로 처리 로그 확인 가능
- 앱 초기화 버튼으로 설정 초기화 가능

## 시스템 요구사항

- Windows 10 이상 또는 macOS 10.13 이상
- 최소 4GB RAM
- 500MB 이상의 여유 디스크 공간
- 인터넷 연결 (최초 실행 시 폰트 다운로드)

## 개발 환경

- Node.js 18.x 이상
- npm 9.x 이상
- Electron 24.x
- TypeScript 5.x
- Sharp 0.33.x
- TailwindCSS 3.x

## 버전 관리

커밋 메시지에 따라 자동으로 버전이 업데이트됩니다:

1. **일반 업데이트** (z 증가)
   - 일반적인 커밋
   - 예: `fix: 버그 수정`

2. **마이너 업데이트** (y 증가)
   - 커밋 메시지에 `#minor` 포함
   - 예: `feat: 새로운 기능 추가 #minor`

3. **메이저 업데이트** (x 증가)
   - 커밋 메시지에 `#major` 포함
   - 예: `feat: 주요 기능 변경 #major`

4. **버전 업데이트 제외**
   - 커밋 메시지에 `#noversion` 포함
  
## 기여자
<a href = "https://github.com/Hobby2025/image_splitter/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=Hobby2025/image_splitter"/>
</a>

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---
