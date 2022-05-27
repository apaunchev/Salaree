import { formatCurrency, formatNumber } from 'lib/math';

export function Salary({ range, rangeOriginal, currency, isGross }) {
  range = range.map(formatNumber);
  rangeOriginal = rangeOriginal.map(formatNumber);

  if (isGross) {
    return (
      <abbr
        title={`${renderSalaryRange(rangeOriginal, currency)} gross`}
        className="whitespace-nowrap"
      >
        {renderSalaryRange(range, currency)}
      </abbr>
    );
  }

  return (
    <span className="whitespace-nowrap">
      {renderSalaryRange(range, currency)}
    </span>
  );
}

function renderSalaryRange(range, currency) {
  if (range[0] === range[1]) {
    return formatCurrency(range[0], currency);
  }

  return `${range[0]}–${formatCurrency(range[1], currency)}`;
}
