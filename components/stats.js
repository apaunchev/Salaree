import { sortAsc } from 'lib/helpers';
import { mean, median, quantile, round } from 'lib/math';

function formatData(data) {
  return data
    .map(item => item.salary)
    .map(item => item.range)
    .map(item => {
      if (item[1]) {
        return round(mean(item));
      }

      return round(item[0]);
    });
}

export function Stats({ listings }) {
  const formattedListings = formatData(listings);
  const sortedListings = sortAsc(formattedListings);

  if (listings.length === 0) {
    return null;
  }

  return (
    <ul>
      <li>Listings: {listings.length}</li>
      <li>Lowest: {sortedListings.at(0) || 0}</li>
      <li>Highest: {sortedListings.at(-1) || 0}</li>
      <li>Median: {round(median(formattedListings))}</li>
      <li>25th: {round(quantile(formattedListings, 0.25))}</li>
      <li>75th: {round(quantile(formattedListings, 0.75))}</li>
      <li>90th: {round(quantile(formattedListings, 0.9))}</li>
    </ul>
  );
}
