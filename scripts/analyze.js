const fs = require('fs/promises');
const path = require('path');

const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
const sortAsc = arr => arr.sort((a, b) => a - b);
const sum = arr => arr.reduce((a, b) => a + b, 0);
const mean = arr => sum(arr) / arr.length;
function median(arr) {
  const sorted = Array.from(arr).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}
const quantile = (arr, q) => {
  const sorted = sortAsc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};
const percentile = (arr, val) =>
  (100 *
    arr.reduce(
      (acc, v) => acc + (v < val ? 1 : 0) + (v === val ? 0.5 : 0),
      0,
    )) /
  arr.length;

const formatData = (data, location, title) => {
  if (location) {
    data = data.filter(i => i.location.includes(location));
  }

  if (title) {
    data = data.filter(i =>
      i.title.toLowerCase().includes(title.toLowerCase()),
    );
  }

  return data
    .map(item => item.salary)
    .map(item => item.range)
    .map(item => {
      if (item[1]) {
        return round((item[0] + item[1]) / 2);
      }

      return round(item[0]);
    });
};

const run = async () => {
  const filePath = path.join(
    __dirname,
    '../data/scrapes/dev.bg/2022-05-23.json',
  );
  const file = await fs.readFile(filePath);
  const contents = JSON.parse(file);
  const data = formatData(contents);

  const sorted = sortAsc(data);
  const output = {
    entries: sorted.length,
    lowest: sorted[0],
    mean: mean(sorted),
    median: median(sorted),
    highest: sorted[sorted.length - 1],
    quantiles: {
      '.25': quantile(sorted, 0.25),
      '.75': quantile(sorted, 0.75),
      '.90': quantile(sorted, 0.9),
    },
  };

  console.log(output);

  // calculate in which percentile your salary is:
  console.log(percentile(data, 5000));
};

run();
