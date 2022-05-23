import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function Home() {
  const { data, error } = useSWR('/api/latest-scrape/dev.bg', fetcher);

  if (error) return <div>Failed to load</div>;

  if (!data) return <div>Loading...</div>;

  return <span>{data.length} listings</span>;
}
