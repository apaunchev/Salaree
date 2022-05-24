import fs from 'fs';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { convertGrossToNet } from './common.mjs';

// We track the category "IT - All" (56) which supposedly combines all IT jobs:
export const JOBS_URL =
  'https://www.jobs.bg/front_job_search.php?categories[0]=56&salary_from=1&ajax=1';

const fetchListings = async () => {
  let page = 1;
  const initial = await fetchPage();
  let data = initial.data;

  if (!initial.isLastPage) {
    let paginate = true;

    while (paginate) {
      page++;
      const next = await fetchPage(page);
      data = [...data, ...next.data];
      paginate = !next.isLastPage;
    }
  }

  return data;
};

const fetchPage = async (page = 1) => {
  console.log(`💻 Fetching page ${page}...`);

  const response = await fetch(`${JOBS_URL}&page=${page}`);
  const body = await response.text();

  const $ = load(body);
  const listingsEl = $('body > ul > li');
  const data = [];

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

      data.push({
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

  return { data, isLastPage: listingsEl.length === 1 };
};

const parseJobInfo = str => {
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
};

const scrape = async () => {
  const listings = await fetchListings();
  const fileName = `${new Date().toISOString().substring(0, 10)}.json`;

  console.log('💻 Writing scrape...');
  fs.writeFileSync(`data/jobs.bg/${fileName}`, JSON.stringify(listings));

  console.log('💻 Done!');
};

scrape();
