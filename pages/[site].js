import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Container } from 'components/container';
import { Stats } from 'components/stats';
import { Table } from 'components/table';
import { fetcher } from 'lib/fetcher';
import { getUniqueValues } from 'lib/helpers';
import { Select } from 'components/select';
import { Input } from 'components/input';
import { Button } from 'components/button';

export default function Home() {
  const {
    query: { site },
  } = useRouter();

  const { data, mutate } = useSWR(
    site ? `/api/latest-scrape/${site}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
    },
  );

  const [shouldRefresh, setShouldRefresh] = useState(false);
  const { isValidating: isRefreshing } = useSWR(
    shouldRefresh ? `/api/scrape/${site}` : null,
    fetcher,
    {
      onSuccess: data => {
        if (data.ok) {
          mutate();
        }

        setShouldRefresh(false);
      },
    },
  );

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState('');
  const [salarySortDirection, setSalarySortDirection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const postings = useMemo(
    () =>
      filterPostings(
        data?.items,
        selectedLocation,
        selectedSeniority,
        salarySortDirection,
        searchTerm,
      ),
    [
      data?.items,
      selectedLocation,
      selectedSeniority,
      salarySortDirection,
      searchTerm,
    ],
  );
  const locations = useMemo(
    () => getUniqueValues(data?.items.map(i => i.location)),
    [data?.items],
  );

  function handleSalarySortClick() {
    if (!salarySortDirection) {
      setSalarySortDirection('asc');
    } else if (salarySortDirection === 'asc') {
      setSalarySortDirection('desc');
    } else if (salarySortDirection === 'desc') {
      setSalarySortDirection(null);
    }
  }

  function handleSearchTermChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleSelectedLocationChange(e) {
    setSelectedLocation(e.target.value);
  }

  function handleSelectedSeniorityChange(e) {
    setSelectedSeniority(e.target.value);
  }

  function handleResetClick() {
    setSelectedLocation('');
    setSelectedSeniority('');
    setSearchTerm('');
  }

  function handleRefreshClick() {
    setShouldRefresh(true);
  }

  if (!data) {
    return (
      <Container>
        <p>Loading....</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex items-center gap-4 pb-4 border-b">
        <Select
          value={selectedLocation}
          onChange={handleSelectedLocationChange}
        >
          <option value="">Choose location</option>
          {locations.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </Select>
        <Select
          value={selectedSeniority}
          onChange={handleSelectedSeniorityChange}
        >
          <option value="none">Choose seniority</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </Select>
        <Input
          placeholder="Search"
          type="search"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <Button onClick={handleResetClick}>Reset</Button>
      </div>
      <Stats postings={postings} />
      <Table
        postings={postings}
        salarySortDirection={salarySortDirection}
        onSalarySortClick={handleSalarySortClick}
      />
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button disabled={isRefreshing} onClick={handleRefreshClick}>
          Refresh
        </Button>
        <p className="text-sm">
          Last scrape: {new Date(data.scrapedAt).toLocaleString()}
        </p>
      </div>
    </Container>
  );
}

function filterPostings(
  postings = [],
  location,
  seniority,
  salarySortDirection,
  searchTerm,
) {
  const whitelistedTitles = new RegExp(
    /(front[- ]?end|javascript|js|web|react|angular|vue)/,
    'gi',
  );
  const blacklistedTitles = new RegExp(/(full[- ]?stack|node)/, 'gi');

  postings = postings
    .filter(p => p.title.match(whitelistedTitles))
    .filter(p => !p.title.match(blacklistedTitles));

  if (location) {
    postings = postings.filter(p => p.location === location);
  }

  if (seniority) {
    let whitelist;
    let blacklist;

    switch (seniority) {
      case 'junior':
        whitelist = new RegExp(/(junior)/, 'gi');
        blacklist = new RegExp(/(senior|lead|experienced)/, 'gi');

        postings = postings
          .filter(p => p.title.match(whitelist))
          .filter(p => !p.title.match(blacklist));

        break;
      case 'mid':
        whitelist = new RegExp(/(mid|regular|\w)/, 'gi');
        blacklist = new RegExp(/(junior|senior|lead|experienced)/, 'gi');

        postings = postings
          .filter(p => p.title.match(whitelist))
          .filter(p => !p.title.match(blacklist));

        break;
      case 'senior':
        whitelist = new RegExp(/(senior|lead|experienced)/, 'gi');
        blacklist = new RegExp(/(junior)/, 'gi');

        postings = postings
          .filter(p => p.title.match(whitelist))
          .filter(p => !p.title.match(blacklist));

        break;
      default:
        break;
    }
  }

  if (searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    postings = postings.filter(
      l =>
        l.title.toLowerCase().includes(searchTerm) ||
        l.company.name.toLowerCase().includes(searchTerm),
    );
  }

  if (salarySortDirection) {
    switch (salarySortDirection) {
      case 'asc':
        postings = postings.sort(
          (a, b) => b.salary.range[0] - a.salary.range[0],
        );
        break;
      case 'desc':
        postings = postings.sort(
          (a, b) => a.salary.range[0] - b.salary.range[0],
        );
        break;
      default:
        break;
    }
  }

  return postings;
}
