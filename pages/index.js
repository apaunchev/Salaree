import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from 'lib/fetcher';
import { Salary } from 'components/salary';
import { mean, median, quantile, round, sortAsc } from 'lib/math';

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

export default function Home() {
  const { data, error } = useSWR('/api/latest-scrape/dev.bg', fetcher);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (data) {
      setLocations([...new Set(data.map(listing => listing.location))]);
    }
  }, [data]);

  useEffect(() => {
    if (locations) {
      setSelectedLocation(locations[0]);
    }
  }, [locations]);

  useEffect(() => {
    if (data && selectedLocation) {
      const ignoredTitlesRegex = new RegExp(/full[- ]?stack/, 'gi');
      setListings(
        data
          .filter(listing => listing.location === selectedLocation)
          .filter(listing => !listing.title.match(ignoredTitlesRegex)),
      );
    }
  }, [data, selectedLocation]);

  if (error) return <div>Failed to load</div>;

  if (!data) return <div>Loading...</div>;

  const formattedListings = formatData(listings);
  const sortedListings = sortAsc(formattedListings);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4">
        <select
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
        >
          {locations.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <span>Listings: {listings.length}</span>
        <span>Lowest: {sortedListings.at(0)}</span>
        <span>Highest: {sortedListings.at(-1)}</span>
        <span>Median: {median(formattedListings)}</span>
        <span>25th: {round(quantile(formattedListings, 0.25))}</span>
        <span>75th: {round(quantile(formattedListings, 0.75))}</span>
        <span>90th: {round(quantile(formattedListings, 0.9))}</span>
      </div>
      <ol>
        {listings.map(item => {
          return (
            <li key={item.key} className={item.key}>
              {item.date} - {item.company.name} -{' '}
              <a href={item.url}>{item.title}</a> - {item.location} -{' '}
              <Salary {...item.salary} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
