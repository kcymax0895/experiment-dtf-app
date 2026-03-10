const { execSync } from 'child_process';
const fs = require('fs');

try {
    execSync('git add .', { stdio: 'inherit' });
    try {
        execSync('git commit -m "Vercel 빌드 수정 및 누락된 파일 업로드"', { stdio: 'inherit' });
    } catch (e) { /* ignore if nothing to commit */ }
    execSync('git push origin main', { stdio: 'inherit' });
    fs.writeFileSync('push-success.txt', 'SUCCESS');
} catch (err) {
    fs.writeFileSync('push-error.txt', err.toString() + '\\n' + (err.stdout ? err.stdout.toString() : '') + '\\n' + (err.stderr ? err.stderr.toString() : ''));
}
