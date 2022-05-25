import fs from 'fs';
import path from 'path';

function orderRecentFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(file => fs.lstatSync(path.join(dir, file)).isFile())
    .map(file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .map(file => file.file);
}

export function getMostRecentFile(dir) {
  const files = orderRecentFiles(path.join(process.cwd(), dir));

  return files.length > 0 ? files[0] : undefined;
}
