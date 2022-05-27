import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { range } from 'lib/helpers';
import { formatCurrency, median, quantile } from 'lib/math';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  annotationPlugin,
);

export function Chart({ data }) {
  const chartData = useMemo(
    () =>
      data.reduce((acc, cur) => {
        const band = getBandForSalary(cur);

        if (acc[band]) {
          acc[band]++;
        } else {
          acc[band] = 1;
        }

        return acc;
      }, generateBands(13)),
    [data],
  );
  const labels = useMemo(
    () => Object.keys(chartData).map(getBandTitle),
    [chartData],
  );

  const medianBand = getBandForSalary(median(data));
  const _75thBand = getBandForSalary(quantile(data, 0.75));
  const _90thBand = getBandForSalary(quantile(data, 0.9));
  const isOverlapping =
    medianBand === _75thBand ||
    medianBand === _90thBand ||
    _75thBand === _90thBand;

  return (
    <div className="relative h-[400px] w-full">
      <Bar
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              display: false,
              suggestedMax: 20,
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            annotation: {
              annotations: {
                median: {
                  type: 'line',
                  scaleID: 'x',
                  value: getBandTitle(medianBand),
                  borderColor: '#111827',
                  borderWidth: 1,
                  borderDash: [3],
                  label: {
                    enabled: true,
                    content: 'Median',
                    position: 'start',
                  },
                },
                '75th': {
                  display: !isOverlapping,
                  type: 'line',
                  scaleID: 'x',
                  value: getBandTitle(_75thBand),
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  label: {
                    enabled: true,
                    content: '75th',
                    position: 'start',
                    backgroundColor: '#9CA3AF',
                  },
                },
                '90th': {
                  display: !isOverlapping,
                  type: 'line',
                  scaleID: 'x',
                  value: getBandTitle(_90thBand),
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  label: {
                    enabled: true,
                    content: '90th',
                    position: 'start',
                    backgroundColor: '#9CA3AF',
                  },
                },
              },
            },
          },
        }}
        data={{
          labels,
          datasets: [
            {
              label: 'Postings',
              data: Object.values(chartData),
              backgroundColor: '#4F46E5',
              hoverBackgroundColor: '#6366F1',
              minBarLength: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function getBandForSalary(n) {
  return Math.floor(n / 1000);
}

function getBandTitle(band) {
  band = parseInt(band);

  return `${1000 * band}-${formatCurrency(band * 1000 + 999)}`;
}

function generateBands(n = 13) {
  return range(1, n).reduce((acc, cur) => {
    acc[cur] = 0;

    return acc;
  }, {});
}
