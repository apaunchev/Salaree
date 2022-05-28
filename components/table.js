import { Salary } from './salary';

export function Table({ postings, salarySortDirection, onSalarySortClick }) {
  if (postings.length === 0) {
    return <p>No postings to show.</p>;
  }

  return (
    <table className="table-fixed w-full">
      <thead>
        <tr className="text-left">
          <th className="p-1 w-[200px]">Location</th>
          <th className="p-1 w-[250px]">Company</th>
          <th className="p-1">Title</th>
          <th className="p-1 w-[160px] text-right">
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
        {postings.map(({ key, company, url, title, salary, location }) => {
          return (
            <tr key={key} className="hover:bg-indigo-50">
              <td className="p-1 truncate">{location}</td>
              <td className="p-1 truncate">{company.name}</td>
              <td className="p-1 truncate">
                <a href={url}>{title}</a>
              </td>
              <td className="p-1 truncate text-right">
                <Salary {...salary} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
