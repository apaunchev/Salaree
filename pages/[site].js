import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from 'lib/fetcher';
import { Salary } from 'components/salary';
import { mean, median, quantile, round, sortAsc } from 'lib/math';
import { useRouter } from 'next/router';
import { getUniqueValues } from 'lib/utils';

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

function filterListings(listings, location, seniority) {
  const whitelistedTitles = new RegExp(
    /(front[- ]?end|javascript|js|web|react|angular|vue)/,
    'gi',
  );
  const blacklistedTitles = new RegExp(/(full[- ]?stack|node)/, 'gi');

  listings = listings
    .filter(listing => listing.title.match(whitelistedTitles))
    .filter(listing => !listing.title.match(blacklistedTitles));

  if (location) {
    listings = listings.filter(l => l.location === location);
  }

  if (seniority) {
    let whitelist;
    let blacklist;

    switch (seniority) {
      case 'junior':
        whitelist = new RegExp(/(junior)/, 'gi');
        blacklist = new RegExp(/(senior|lead|experienced)/, 'gi');

        listings = listings
          .filter(l => l.title.match(whitelist))
          .filter(l => !l.title.match(blacklist));

        break;
      case 'mid':
        whitelist = new RegExp(/(mid|regular|\w)/, 'gi');
        blacklist = new RegExp(/(junior|senior|lead|experienced)/, 'gi');

        listings = listings
          .filter(l => l.title.match(whitelist))
          .filter(l => !l.title.match(blacklist));

        break;
      case 'senior':
        whitelist = new RegExp(/(senior|lead|experienced)/, 'gi');
        blacklist = new RegExp(/(junior)/, 'gi');

        listings = listings
          .filter(l => l.title.match(whitelist))
          .filter(l => !l.title.match(blacklist));

        break;
      default:
        break;
    }
  }

  return listings;
}

export default function Home() {
  const router = useRouter();
  const { site } = router.query;
  const { data, error } = useSWR(
    site ? `/api/latest-scrape/${site}` : null,
    fetcher,
  );
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [listings, setListings] = useState([]);
  const [selectedSeniority, setSelectedSeniority] = useState('');

  useEffect(() => {
    if (data) {
      const listings = filterListings(data);
      const locations = getUniqueValues(
        listings.map(listing => listing.location),
      );

      setListings(listings);
      setLocations(locations);
      setSelectedLocation(locations[0]);
    }
  }, [data]);

  useEffect(() => {
    if (selectedLocation) {
      setListings(filterListings(data, selectedLocation, selectedSeniority));
    }

    if (selectedSeniority) {
      setListings(filterListings(data, selectedLocation, selectedSeniority));
    }
  }, [data, selectedLocation, selectedSeniority]);

  if (error) return <div>Failed to load</div>;

  if (!data) return <div>Loading...</div>;

  const formattedListings = formatData(listings);
  const sortedListings = sortAsc(formattedListings);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 justify-between">
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
            <select
              value={selectedSeniority}
              onChange={e => setSelectedSeniority(e.target.value)}
            >
              <option value="none">Choose seniority</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
            <span>Listings: {listings.length}</span>
            <span>Lowest: {sortedListings.at(0) || 0}</span>
            <span>Highest: {sortedListings.at(-1) || 0}</span>
            <span>Median: {round(median(formattedListings))}</span>
            <span>25th: {round(quantile(formattedListings, 0.25))}</span>
            <span>75th: {round(quantile(formattedListings, 0.75))}</span>
            <span>90th: {round(quantile(formattedListings, 0.9))}</span>
          </div>
          <div>
            <button className="cursor-pointer">Refresh</button>
          </div>
        </div>
        <table className="table-auto w-full">
          <thead>
            <tr className="text-left">
              <th>Date</th>
              <th>Company</th>
              <th>Title</th>
              <th className="text-right">Salary</th>
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
                  <td className="text-right">
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
