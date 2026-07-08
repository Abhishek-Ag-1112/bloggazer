import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcProjectDir = path.join(rootDir, 'bloggazers', 'project');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      // Skip node_modules during copy to speed it up (we will re-run npm install anyway)
      if (childItemName === 'node_modules' || childItemName === '.git') {
        return;
      }
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function deleteRecursiveSync(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

async function run() {
  console.log("Checking project paths...");
  if (!fs.existsSync(srcProjectDir)) {
    console.error(`Error: Source project directory not found: ${srcProjectDir}`);
    process.exit(1);
  }

  console.log("Copying latest frontend files to root...");
  copyRecursiveSync(path.join(srcProjectDir, 'frontend'), rootDir);

  console.log("Copying backend files to root/backend...");
  copyRecursiveSync(path.join(srcProjectDir, 'backend'), path.join(rootDir, 'backend'));

  console.log("Removing duplicate bloggazers folder...");
  deleteRecursiveSync(path.join(rootDir, 'bloggazers'));

  console.log("Migration complete!");
  console.log("Please notify the AI assistant that the files are migrated.");
}

run();
