import { SCRAPERS } from 'lib/constants';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname == '/') {
    const url = req.nextUrl.clone();

    url.pathname = `/${SCRAPERS[0]}`;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
