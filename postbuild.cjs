const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'dist', 'client');
const distDir = path.join(__dirname, 'dist');

function moveRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const items = fs.readdirSync(src);
    for (const item of items) {
      moveRecursive(path.join(src, item), path.join(dest, item));
    }
    fs.rmdirSync(src);
  } else {
    fs.renameSync(src, dest);
  }
}

if (fs.existsSync(clientDir)) {
  console.log('Postbuild: Moving dist/client contents to dist...');
  const items = fs.readdirSync(clientDir);
  for (const item of items) {
    moveRecursive(path.join(clientDir, item), path.join(distDir, item));
  }
  fs.rmdirSync(clientDir);
  console.log('Postbuild complete.');
} else {
  console.log('Postbuild: dist/client not found, skipping.');
}
