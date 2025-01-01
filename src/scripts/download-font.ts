import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";

const fontUrl: string =
  "https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/RIDIBatang.woff";
const fontDir: string = path.join(__dirname, "../../public/fonts");
const fontPath: string = path.join(fontDir, "RIDIBatang.woff");

// fonts 디렉토리가 없으면 생성
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

// 폰트 파일 다운로드
https
  .get(fontUrl, (response: IncomingMessage) => {
    const file = fs.createWriteStream(fontPath);
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log("폰트 다운로드 완료");
    });
  })
  .on("error", (err: Error) => {
    console.error("폰트 다운로드 실패:", err);
  });
