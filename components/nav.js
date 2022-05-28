import Link from 'next/link';
import { useRouter } from 'next/router';
import { routes } from 'lib/routes';

export function Nav() {
  const router = useRouter();

  return (
    <div className="font-medium text-gray-500 border-b">
      <nav className="flex flex-wrap items-center gap-4 -mb-px">
        {Object.keys(routes).map(key => {
          const { href, activePaths, title } = routes[key];

          return (
            <Link key={key} href={href}>
              <a
                className={`inline-block py-3 border-b-2 border-transparent ${
                  activePaths.includes(router.query.site)
                    ? 'border-brand'
                    : 'hover:border-gray-300'
                }`}
              >
                {title}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
