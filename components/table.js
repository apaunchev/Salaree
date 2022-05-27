import { Salary } from './salary';

export function Table({ postings, salarySortDirection, onSalarySortClick }) {
  if (postings.length === 0) {
    return <p>No postings found.</p>;
  }

  return (
    <table className="table-auto w-full">
      <thead>
        <tr className="text-left">
          <th>Date</th>
          <th>Company</th>
          <th>Title</th>
          <th className="text-right">
            <button
              className="font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-hover"
              onClick={onSalarySortClick}
            >
              Salary{' '}
              {salarySortDirection === 'desc'
                ? '⬇️'
                : salarySortDirection === 'asc'
                ? '⬆️'
                : null}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {postings.map(({ key, date, company, url, title, salary }) => {
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
  );
}
