import fs from 'fs';
import path from 'path';
import { getMostRecentFile } from 'lib/files';

export default async function latestScrape(req, res) {
  const { site } = req.query;
  const dir = `data/${site}`;
  const file = getMostRecentFile(dir);
  const readFile = fs.readFileSync(path.join(process.cwd(), dir, file));

  return res.status(200).json(JSON.parse(readFile));
}
