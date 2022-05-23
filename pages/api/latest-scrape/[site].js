const fs = require('fs');
const path = require('path');

const getMostRecentFile = dir => {
  const files = orderRecentFiles(path.join(process.cwd(), dir));
  return files.length ? files[0] : undefined;
};

const orderRecentFiles = dir => {
  return fs
    .readdirSync(dir)
    .filter(file => fs.lstatSync(path.join(dir, file)).isFile())
    .map(file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .map(file => file.file);
};

export default async function latestScrape(req, res) {
  const { site } = req.query;
  const dir = `data/scrapes/${site}`;
  const file = getMostRecentFile(dir);
  const readFile = fs.readFileSync(path.join(process.cwd(), dir, file));

  return res.status(200).json(JSON.parse(readFile));
}
