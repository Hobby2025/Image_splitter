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

## 버전 관리 가이드

이 프로젝트는 자동화된 버전 관리 시스템을 사용합니다. 버전은 `x.y.z` 형식을 따릅니다.

### 버전 업데이트 규칙

커밋 메시지에 따라 자동으로 버전이 업데이트됩니다:

1. **일반 업데이트** (z 증가)
   - 일반적인 커밋
   - 예: 1.1.2 → 1.1.3

2. **마이너 업데이트** (y 증가, z는 1로 초기화)
   - 커밋 메시지에 `#minor` 포함
   - 예: 1.1.2 → 1.2.1

3. **메이저 업데이트** (x 증가, y와 z는 초기화)
   - 커밋 메시지에 `#major` 포함
   - 예: 1.1.2 → 2.0.1

4. **버전 업데이트 건너뛰기**
   - 커밋 메시지에 `#noversion` 포함
   - 버전이 증가하지 않음

### 사용 예시
```
bash
일반 업데이트
git commit -m "fix: 버그 수정"
마이너 버전 업데이트
git commit -m "feat: 새로운 기능 추가 #minor"
메이저 버전 업데이트
git commit -m "feat: 주요 기능 변경 #major"
```

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