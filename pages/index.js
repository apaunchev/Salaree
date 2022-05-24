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
      const whitelistedTitles = new RegExp(
        /(front[- ]?end|javascript|js|web|react|angular|vue)/,
        'gi',
      );
      const blacklistedTitles = new RegExp(/full[- ]?stack/, 'gi');

      setListings(
        data
          .filter(listing => listing.location === selectedLocation)
          .filter(listing => listing.title.match(whitelistedTitles))
          .filter(listing => !listing.title.match(blacklistedTitles)),
      );
    }
  }, [data, selectedLocation]);

  if (error) return <div>Failed to load</div>;

  if (!data) return <div>Loading...</div>;

  const formattedListings = formatData(listings);
  const sortedListings = sortAsc(formattedListings);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-4">
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
          <span>Lowest: {sortedListings.at(0) || 0}</span>
          <span>Highest: {sortedListings.at(-1) || 0}</span>
          <span>Median: {round(median(formattedListings))}</span>
          <span>25th: {round(quantile(formattedListings, 0.25))}</span>
          <span>75th: {round(quantile(formattedListings, 0.75))}</span>
          <span>90th: {round(quantile(formattedListings, 0.9))}</span>
        </div>
        <table className="table-auto w-full">
          <thead>
            <tr className="text-left">
              <th>Date</th>
              <th>Company</th>
              <th>Title</th>
              <th className="text-center">Salary</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(({ key, date, company, url, title, salary }) => {
              return (
                <tr key={key}>
                  <td>{date}</td>
                  <td>{company.name}</td>
                  <td>
                    <a href={url}>{title}</a>
                  </td>
                  <td className="text-center">
                    <Salary {...salary} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
