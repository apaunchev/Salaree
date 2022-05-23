import useSWR from 'swr';
import { fetcher } from 'lib/fetcher';
import { Salary } from 'components/salary';

export default function Home() {
  const { data, error } = useSWR('/api/latest-scrape/dev.bg', fetcher);

  if (error) return <div>Failed to load</div>;

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <ol>
        {data.map(item => {
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
