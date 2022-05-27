export function filterPostings(
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
          (a, b) => a.salary.range[0] - b.salary.range[0],
        );
        break;
      case 'desc':
        postings = postings.sort(
          (a, b) => b.salary.range[1] - a.salary.range[1],
        );
        break;
      default:
        break;
    }
  }

  return postings;
}
