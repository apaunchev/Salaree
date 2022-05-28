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
import { filterPostings } from 'lib/filter';
import { Spinner } from 'components/spinner';

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
  const { isValidating: isScraping } = useSWR(
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
      setSalarySortDirection('desc');
    } else if (salarySortDirection === 'desc') {
      setSalarySortDirection('asc');
    } else if (salarySortDirection === 'asc') {
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
        <Spinner />
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
        <Button disabled={isScraping} onClick={handleRefreshClick}>
          {isScraping ? 'Scraping...' : 'Scrape'}
        </Button>
        <p className="text-sm">
          Latest scrape:{' '}
          {data.scrapedAt ? new Date(data.scrapedAt).toLocaleString() : 'never'}
        </p>
      </div>
    </Container>
  );
}
