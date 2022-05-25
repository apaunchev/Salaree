import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { getMostRecentFile } from 'lib/files';
import { convertGrossToNet } from 'lib/math';

const MOCK_SCRAPE = false;
const DATA_DIR = 'data/jobs.bg';
const SCRAPE_URL =
  'https://www.jobs.bg/front_job_search.php?categories[]=56&domains[]=1&salary_from=1&ajax=1';

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

    const response = await fetch(`${SCRAPE_URL}&page=${page}`);
    const body = await response.text();

    const $ = load(body);
    const listingsEl = $('body > ul > li');
    const items = [];

    listingsEl.each((_, elem) => {
      const date = $(elem).find('.card-date');
      const title = $(elem).find('.black-link-b');
      const jobInfo = $(elem).find('.card-info.card__subtitle');
      const companyLogo = $(elem).find('.company-card-container .logo');
      const companyName = $(elem).find('.right > a');
      const companyUrl = $(elem).find('.right > a');

      // Filter out elements that might not be listings.
      if (date.length > 0) {
        const parsedJobInfo = parseJobInfo(jobInfo.text().trim());

        // Filter out listings that are not in BGN.
        if (parsedJobInfo.salary.currency !== 'BGN') {
          return;
        }

        items.push({
          key:
            title.attr('href')?.replace('https://www.jobs.bg/job/', '') || null,
          date: date.contents().first().text()?.trim() || null,
          title: title.attr('title')?.trim() || null,
          url: title.attr('href') || null,
          ...parsedJobInfo,
          company: {
            logo: companyLogo.attr('src') || null,
            name: companyName.attr('title').trim() || null,
            url: companyUrl.attr('href') || null,
          },
        });
      }
    });

    return { items, isLastPage: listingsEl.length === 1 };
  }

  function parseJobInfo(str) {
    let [location] = str.split('; ');
    location = location.replace('wifi ', '');
    const salaryText = str.match(/Заплата.*$/)[0];
    const indexOfEnd = salaryText.indexOf(' (');
    const range = salaryText.match(/\d+/g);
    const isGross = salaryText.indexOf('Бруто') !== -1;
    const currency = salaryText.slice(indexOfEnd - 3, indexOfEnd);
    const salary = {
      range:
        isGross && currency === 'BGN'
          ? range.map(convertGrossToNet)
          : range.map(Number),
      rangeOriginal: range.map(Number),
      currency,
      isGross,
    };

    return {
      location,
      salary,
    };
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
