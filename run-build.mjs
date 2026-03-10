import { build } from 'vite';

async function runBuild() {
    try {
        await build();
        console.log('Build completed successfully.');
    } catch (err) {
        console.error('Build failed with error:', err);
    }
}

runBuild();
