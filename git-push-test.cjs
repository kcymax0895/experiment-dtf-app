const { execSync } = require('child_process');
const fs = require('fs');

try {
    execSync('git add .', { stdio: 'pipe' });
    try { execSync('git commit -m "Vercel 에러 최종 해결 및 수동 푸시"', { stdio: 'pipe' }); } catch (e) { }

    const result = execSync('git push origin main', { stdio: 'pipe' });
    fs.writeFileSync('git-push-result.txt', result.toString());
} catch (e) {
    let errOut = e.stderr ? e.stderr.toString() : e.message;
    fs.writeFileSync('git-push-result.txt', 'ERROR:\\n' + errOut);
}
