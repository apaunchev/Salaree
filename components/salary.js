import { formatNumber } from 'lib/math';

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

const renderSalaryRange = (range, currency) =>
  range.length > 1
    ? `${range[0]}–${range[1]} ${currency}`
    : `${range[0]} ${currency}`;
