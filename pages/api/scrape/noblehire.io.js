import fs from 'fs';
import path from 'path';
import { getMostRecentFile } from 'lib/files';
import { convertGrossToNet } from 'lib/math';

const MOCK_SCRAPE = false;
const DATA_DIR = 'data/noblehire.io';
const SCRAPE_URL =
  'https://prod-noblehire-api-000001.appspot.com/job?search=role%3Afrontend';

export default async function handler(req, res) {
  async function fetchData() {
    let page = 0;
    const initial = await fetchPage();
    let items = initial.items;

    if (!initial.isLastPage) {
      let paginate = true;

      while (paginate) {
        page++;
        const next = await fetchPage(page);
        items = [...items, ...next.items];
        paginate = !next.isLastPage;
      }
    }

    return { items, scrapedAt: new Date().toISOString() };
  }

  async function fetchPage(page = 0) {
    console.log(`💻 Fetching page ${page}...`);

    const response = await fetch(`${SCRAPE_URL}&page=${page}`);
    const body = await response.json();

    const items = body?.elements
      .filter(p => p.salaryMin)
      .filter(p => p.salaryCurrency === 'BGN')
      .map(p => {
        const range = [p.salaryMin, p.salaryMax || p.salaryMin];

        return {
          key: p.id || null,
          title: p.title || null,
          url: `https://noblehire.io/${p?.company?.slug}/${p.slug}/view?search=role%3Afrontend`,
          location: p.fullyRemote
            ? 'Remote'
            : p.locations.length > 0
            ? JSON.parse(p.locations?.[0]?.address)?.formatted_address
            : '-',
          salary: {
            range: range.map(convertGrossToNet),
            rangeOriginal: range.map(Number),
            currency: p.salaryCurrency,
            isGross: true, // Always gross
          },
          company: {
            name: p?.company?.brand || null,
          },
        };
      });

    return { items, isLastPage: body?.elements.length === 0 };
  }

  async function scrape() {
    let data;

    if (MOCK_SCRAPE) {
      const mostRecentFile = fs.readFileSync(
        path.join(process.cwd(), DATA_DIR, getMostRecentFile(DATA_DIR)),
      );

      data = {
        ...JSON.parse(mostRecentFile),
        scrapedAt: new Date().toISOString(),
      };
    } else {
      data = await fetchData();
    }

    console.log('💻 Writing scrape...');

    fs.writeFileSync(
      `${DATA_DIR}/${`${new Date().toISOString().substring(0, 10)}.json`}`,
      JSON.stringify(data),
    );

    console.log('💻 Done!');
  }

  await scrape();

  res.status(200).json({ ok: true });
}
