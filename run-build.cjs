import { execSync } from 'child_process';
try {
    const result = execSync('npx vite build', { stdio: 'pipe' });
    console.log('--- STDOUT ---');
    console.log(result.toString());
} catch (err) {
    console.log('--- STDOUT ---');
    console.log(err.stdout ? err.stdout.toString() : '');
    console.log('--- STDERR ---');
    console.log(err.stderr ? err.stderr.toString() : err.message);
}
