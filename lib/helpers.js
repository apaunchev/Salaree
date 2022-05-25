export function getUniqueValues(arr) {
  return [...new Set(arr)];
}

export function sortAsc(arr) {
  return arr.sort((a, b) => a - b);
}
