export function getUniqueValues(arr) {
  return [...new Set(arr)];
}

export function sortAsc(arr) {
  return arr.sort((a, b) => a - b);
}

export function range(start, end, step = 1) {
  const output = [];

  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }

  for (let i = start; i < end; i += step) {
    output.push(i);
  }

  return output;
}
