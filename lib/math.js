import { sortAsc } from './helpers';

export function formatNumber(n) {
  return n.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

export function formatCurrency(n) {
  const formatter = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
  });

  return formatter.format(n);
}

export function round(n) {
  if (!isFinite(n)) {
    return 0;
  }

  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export function mean(arr) {
  return sum(arr) / arr.length;
}

export function median(arr) {
  const sorted = sortAsc(arr);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export function quantile(arr, q) {
  const sorted = sortAsc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export function convertGrossToNet(grossAmount) {
  grossAmount = Number(grossAmount);

  const INSURANCE_THRESHOLD = 3400;
  const CONTRIBUTIONS_PERCENTAGE = 0.1378;
  const INCOME_TAX_PERCENTAGE = 0.1;

  const insuranceContributions =
    Math.min(INSURANCE_THRESHOLD, grossAmount) * CONTRIBUTIONS_PERCENTAGE;
  const incomeTax =
    (grossAmount - insuranceContributions) * INCOME_TAX_PERCENTAGE;

  return grossAmount - insuranceContributions - incomeTax;
}
