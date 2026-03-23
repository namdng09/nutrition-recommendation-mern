// Copies email templates to dist after build
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const src = path.join(
  __dirname,
  'src',
  'shared',
  'utils',
  'email',
  'templates'
);
const dest = path.join(
  __dirname,
  'dist',
  'shared',
  'utils',
  'email',
  'templates'
);

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyRecursiveSync(src, dest);
console.log('Email templates copied to dist.');
