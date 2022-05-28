import fs from 'fs';
import path from 'path';
import { getMostRecentFile } from 'lib/files';

export default async function latestScrape(req, res) {
  const { site } = req.query;
  const dir = `data/${site}`;
  const file = getMostRecentFile(dir);

  if (!file) {
    return res.status(404).json({ items: [], scrapedAt: null });
  }

  return res
    .status(200)
    .json(JSON.parse(fs.readFileSync(path.join(process.cwd(), dir, file))));
}
