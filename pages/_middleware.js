import { scrapers } from 'lib/scrapers';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname == '/') {
    const url = req.nextUrl.clone();

    url.pathname = `/${Object.keys(scrapers)[0]}`;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
