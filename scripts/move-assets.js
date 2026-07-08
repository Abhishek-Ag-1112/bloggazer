import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToMove = [
  'Bloggs.png',
  'avater.png',
  'avater1.PNG',
  'gok.PNG',
  'grid.webp',
  'image.png',
  'image.svg',
  'loader-animation.json',
  'loading.json',
  'logo.png',
  'logo2.png'
];

const srcDir = path.resolve(__dirname, '..');
const destDir = path.join(srcDir, 'public');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

filesToMove.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to public/`);
  } else {
    console.warn(`Source file not found: ${srcPath}`);
  }
});
