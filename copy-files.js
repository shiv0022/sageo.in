const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\RACHIT CHAUHAN\\.gemini\\antigravity-ide\\scratch\\seo-intelligence\\src';
const destDir = 'C:\\Users\\RACHIT CHAUHAN\\seo-intelligence\\src';

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      // Overwrite if exists
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

try {
  copyFolderSync(srcDir, destDir);
  console.log('Successfully copied all src files!');
} catch (err) {
  console.error('Copy failed:', err);
}
