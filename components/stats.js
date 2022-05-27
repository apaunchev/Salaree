import { useMemo } from 'react';
import { formatCurrency, mean, median, quantile, round } from 'lib/math';
import { Chart } from './chart';

export function Stats({ postings }) {
  const formattedSalaries = useMemo(
    () =>
      postings
        .map(item => item.salary)
        .map(item => item.range)
        .map(item => {
          if (item[1]) {
            return round(mean(item));
          }

          return round(item[0]);
        }),
    [postings],
  );

  if (postings.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-[3fr_1fr] pb-4 border-b">
      <div className="pr-6">
        <Chart data={formattedSalaries} />
      </div>
      <div className="border-l pl-6">
        <dl>
          <StatsItem
            title="Median salary (50th percentile)"
            value={formatNumber(median(formattedSalaries))}
            isAccented
          />
          <StatsItem
            title="25th percentile"
            value={formatNumber(quantile(formattedSalaries, 0.25))}
          />
          <StatsItem
            title="75th percentile"
            value={formatNumber(quantile(formattedSalaries, 0.75))}
          />
          <StatsItem
            title="90th percentile"
            value={formatNumber(quantile(formattedSalaries, 0.9))}
          />
        </dl>
      </div>
    </div>
  );
}

function StatsItem({ title, value, isAccented = false }) {
  return (
    <>
      <dt className={`font-semibold text-sm`}>{title}</dt>
      <dd
        className={`mb-3 font-light ${
          isAccented ? 'text-4xl text-brand' : 'text-2xl'
        }`}
      >
        {value}
      </dd>
    </>
  );
}

function formatNumber(n) {
  return formatCurrency(round(n));
}
