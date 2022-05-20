export const formatNumber = n =>
  n.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

export const getAverageInArray = arr =>
  arr.reduce((prev, curr) => prev + curr, 0) / arr.length;

export const getMedianInArray = arr => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);

  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

export const pickUniqueByKey = (array, key) => [
  ...new Set(array.map(item => item[key])),
];

export const getFiltersForKey = (data, key) =>
  pickUniqueByKey(data, key).map(item => ({ text: item, value: item }));

export const filterSorter = (a, b) => a.value.localeCompare(b.value);

export const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
