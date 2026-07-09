const fs = require('fs');
const path = require('path');

function fixCatch(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('catch (err: unknown)')) {
    content = content.replace(/catch \(err: unknown\)/g, 'catch (err: any)');
    changed = true;
  }
  if (content.includes('catch (error: unknown)')) {
    content = content.replace(/catch \(error: unknown\)/g, 'catch (error: any)');
    changed = true;
  }
  if (content.includes('catch (e: unknown)')) {
    content = content.replace(/catch \(e: unknown\)/g, 'catch (e: any)');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed catch blocks in ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixCatch(fullPath);
    }
  }
}

traverseDir(path.join(__dirname, 'src'));
