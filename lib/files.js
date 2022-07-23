import fs from 'fs';
import path from 'path';

function orderRecentFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(file => fs.lstatSync(path.join(dir, file)).isFile())
    .filter(file => !/(^|\/)\.[^/.]/g.test(file)) // Exclude .gitignore
    .map(file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .map(file => file.file);
}

export function getMostRecentFile(dir) {
  dir = path.join(process.cwd(), dir);

  if (!fs.existsSync(dir)) {
    return;
  }

  const files = orderRecentFiles(dir);

  return files.length > 0 ? files[0] : undefined;
}
