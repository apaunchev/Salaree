import { routes } from 'lib/routes';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname == '/') {
    const url = req.nextUrl.clone();

    url.pathname = `/${Object.keys(routes)[0]}`;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
