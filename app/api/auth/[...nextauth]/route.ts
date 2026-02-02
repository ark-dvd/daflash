// app/api/auth/[...nextauth]/route.ts
// NextAuth API route handler with rate limiting
// Handles: /api/auth/signin, /api/auth/signout, /api/auth/callback, /api/auth/session

import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rate-limit';

const nextAuthHandler = NextAuth(authOptions);

/**
 * Wrapper to add rate limiting to auth endpoints
 * 10 requests per minute per IP to prevent brute force attacks
 */
async function handler(request: NextRequest) {
  // Apply strict rate limiting to auth endpoints
  const rateLimited = checkRateLimit(request, 'auth', AUTH_RATE_LIMIT);
  if (rateLimited) {
    return rateLimited;
  }

  // Proceed with NextAuth handler
  return nextAuthHandler(request);
}

export { handler as GET, handler as POST };
