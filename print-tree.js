const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', '.turbo']);
const MAX_DEPTH = 3;

function printTree(dir, depth = 0, prefix = '') {
  if (depth > MAX_DEPTH) return;

  const items = fs.readdirSync(dir).sort();

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const isDir = fs.statSync(fullPath).isDirectory();

    if (IGNORED_DIRS.has(item)) continue;

    process.stdout.write(prefix + (isDir ? '📁 ' : '📄 ') + item + '\n');

    if (isDir) {
      printTree(fullPath, depth + 1, prefix + '   ');
    }
  }
}

printTree('.');