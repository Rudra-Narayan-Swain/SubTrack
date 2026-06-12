const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const stat = fs.lstatSync(path.join(from, element));
        if (stat.isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

console.log('Building mobile app for web...');
try {
    // 1. Run export command (defaults to mobile-app/dist)
    execSync('npx expo export --platform web', {
        cwd: path.join(__dirname, 'mobile-app'),
        stdio: 'inherit'
    });

    const srcDir = path.join(__dirname, 'mobile-app', 'dist');
    const destDir = path.join(__dirname, 'mobile');

    console.log('Copying build to root/mobile directory...');
    
    // 2. Clean destDir if it exists
    if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
    }

    // 3. Copy files
    copyFolderSync(srcDir, destDir);
    console.log('Mobile web build copied successfully to root/mobile!');
} catch (error) {
    console.error('Error during mobile web build:', error.message);
    process.exit(1);
}
