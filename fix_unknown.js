const fs = require('fs');
const path = require('path');

function fixUnknown(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('as unknown')) {
    content = content.replace(/as unknown/g, 'as any');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Reverted 'as unknown' to 'as any' in ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixUnknown(fullPath);
    }
  }
}

traverseDir(path.join(__dirname, 'src'));
