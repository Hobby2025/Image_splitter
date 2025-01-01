const https = require('https');
const fs = require('fs');
const path = require('path');

const fontUrl = 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/RIDIBatang.woff';
const fontDir = path.join(__dirname, '../public/fonts');
const fontPath = path.join(fontDir, 'RIDIBatang.woff');

// fonts 디렉토리가 없으면 생성
if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
}

// 폰트 파일 다운로드
https.get(fontUrl, (response) => {
    const file = fs.createWriteStream(fontPath);
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('폰트 다운로드 완료');
    });
}).on('error', (err) => {
    console.error('폰트 다운로드 실패:', err);
}); 