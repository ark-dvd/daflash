// middleware.ts
// Next.js middleware — runs on every request matching the config
// Protects /admin routes by checking for valid session

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (but NOT /api/auth/* which NextAuth needs)
  if (pathname.startsWith('/admin')) {
    // CRITICAL: Same cookie name as config.ts
    const token = await getToken({
      req: request,
      cookieName: 'next-auth.session-token',
    });

    // If not authenticated, redirect to the NextAuth sign-in page
    if (!token) {
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// Only run middleware on /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
