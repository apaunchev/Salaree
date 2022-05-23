import { formatNumber } from 'lib/helpers';

export function Salary({ range, rangeOriginal, currency, isGross }) {
  range = range.map(formatNumber);
  rangeOriginal = rangeOriginal.map(formatNumber);

  return (
    <span className="whitespace-nowrap">
      {renderSalaryRange(range, currency)}{' '}
      {isGross && (
        <abbr title={`${renderSalaryRange(rangeOriginal, currency)} gross`}>
          ?
        </abbr>
      )}
    </span>
  );
}

const renderSalaryRange = (range, currency) =>
  range.length > 1
    ? `${range[0]}–${range[1]} ${currency}`
    : `${range[0]} ${currency}`;
