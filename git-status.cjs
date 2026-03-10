const { execSync } from 'child_process';
const fs = require('fs');
try {
    const result = execSync('git status', { stdio: 'pipe' });
    fs.writeFileSync('git-output.txt', result.toString());
} catch (err) {
    let out = err.stdout ? err.stdout.toString() : '';
    let errOut = err.stderr ? err.stderr.toString() : err.message;
    fs.writeFileSync('git-output.txt', out + '\n---ERR---\n' + errOut);
}
