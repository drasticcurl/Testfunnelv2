import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /pwa/* routes (except /pwa/login)
  if (pathname.startsWith('/pwa') && !pathname.startsWith('/pwa/login')) {
    const session = request.cookies.get('dormibien_session');

    if (!session || !session.value) {
      const loginUrl = new URL('/pwa/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/pwa/:path*'],
};
