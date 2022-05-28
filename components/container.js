import { Nav } from './nav';

export function Container({ children }) {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-4">
        <Nav />
        {children}
      </div>
    </div>
  );
}
