import { execSync } from 'child_process';
import * as os from 'os';

const platform = os.platform();
const arch = os.arch();

console.log(`Rebuilding Sharp for ${platform} ${arch}`);

try {
    if (platform === 'win32') {
        execSync('npm rebuild --platform=win32 --arch=x64 sharp', { stdio: 'inherit' });
    } else if (platform === 'darwin') {
        execSync('npm rebuild --platform=darwin --arch=x64 sharp', { stdio: 'inherit' });
        execSync('electron-rebuild -f -w sharp', { stdio: 'inherit' });
    } else {
        console.error('Unsupported platform');
        process.exit(1);
    }
    console.log('Sharp rebuild completed successfully');
} catch (error) {
    console.error('Failed to rebuild Sharp:', error);
    process.exit(1);
} 