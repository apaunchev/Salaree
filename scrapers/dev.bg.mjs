import fs from 'fs';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { convertGrossToNet } from './common.mjs';

export const JOBS_URL = 'https://dev.bg/company/jobs/front-end-development/';

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

  const response = await fetch(
    page === 1 ? JOBS_URL : `${JOBS_URL}/page/${page}/`,
  );
  const body = await response.text();

  const $ = load(body);
  const listingsEl = $('.job-list-item');
  const data = [];

  listingsEl.each((_, elem) => {
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

    // We only want the listings with a salary
    if (!salary) {
      return;
    }

    data.push({
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

  return { data, isLastPage: listingsEl.length === 0 };
};

const scrape = async () => {
  const listings = await fetchListings();
  const fileName = `${new Date().toISOString().substring(0, 10)}.json`;

  console.log('💻 Writing scrape...');
  fs.writeFileSync(`data/dev.bg/${fileName}`, JSON.stringify(listings));

  console.log('💻 Done!');
};

scrape();
