import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { getMostRecentFile } from 'lib/files';
import { convertGrossToNet } from 'lib/math';

const MOCK_SCRAPE = false;
const DATA_DIR = 'data/dev.bg';
const SCRAPE_URL = 'https://dev.bg/company/jobs/front-end-development/';

export default async function handler(req, res) {
  async function fetchData() {
    let page = 1;
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

  async function fetchPage(page = 1) {
    console.log(`💻 Fetching page ${page}...`);

    const response = await fetch(
      page === 1 ? SCRAPE_URL : `${SCRAPE_URL}/page/${page}/`,
    );
    const body = await response.text();

    const $ = load(body);
    const postingsEl = $('.job-list-item');
    const items = [];

    postingsEl.each((_, elem) => {
      const date = $(elem).find('.date');
      const title = $(elem).find('.job-title');
      const url = $(elem).find('.overlay-link');
      const companyLogo = $(elem).find('.company-logo');
      const companyName = $(elem).find('.company-name');
      const tags = $(elem).find('.tags-wrap .badge');

      let location;
      let salary;

      tags.each((_, elem) => {
        const isSalaryTag = $(elem).hasClass('blue');

        if (isSalaryTag) {
          const range = $(elem)
            .contents()
            .eq(2)
            .text()
            .trim()
            .replaceAll(' ', '')
            .replace('лв.', '')
            .split('-');
          const type = $(elem).find('.hidden-text').text().trim();
          const isGross = Boolean(type.match(/b2b/i));

          salary = {
            range: isGross ? range.map(convertGrossToNet) : range.map(Number),
            rangeOriginal: range.map(Number),
            currency: 'BGN',
            isGross,
          };
        } else {
          // Location tags - standard and remote
          location = $(elem).contents().last()?.text().trim() || null;
        }
      });

      // We only want the postings with a salary
      if (!salary) {
        return;
      }

      items.push({
        key: $(elem).data('job-id') || null,
        date: date.text()?.trim() || null,
        title: title.text()?.trim() || null,
        url: url.attr('href') || null,
        location,
        salary,
        company: {
          logo: companyLogo.data('lazy-srcset')?.split(' ')[0] || null,
          name: companyName.text()?.trim() || null,
        },
      });
    });

    return { items, isLastPage: postingsEl.length === 0 };
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
