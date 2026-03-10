const { execSync } from 'child_process';
const fs = require('fs');

try {
    const log = execSync("git log -1 --stat").toString();
    const status = execSync("git status").toString();
    fs.writeFileSync('git-status.json', JSON.stringify({ log, status }));
} catch (e) {
    fs.writeFileSync('git-status.json', JSON.stringify({ error: e.toString() }));
}
