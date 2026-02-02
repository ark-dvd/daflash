// lib/auth/middleware.ts
// Helper function to protect API routes — validates JWT, checks email whitelist, and rate limits
// Used in every /api/admin/* route

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkRateLimit, ADMIN_RATE_LIMIT } from '@/lib/rate-limit';

/**
 * Get allowed admin emails from environment variable.
 * SECURITY: If ADMIN_ALLOWED_EMAILS is not set or empty, DENY ALL requests.
 */
function getAllowedEmails(): string[] {
  const envValue = process.env.ADMIN_ALLOWED_EMAILS;
  if (!envValue || envValue.trim() === '') {
    return [];
  }
  return envValue.split(',').map((email) => email.trim().toLowerCase());
}

/**
 * Validates that the request comes from an authenticated admin user.
 * Also applies rate limiting (60 requests/minute per IP).
 * Returns NextResponse with 401/403/429 if not authorized, or null if valid.
 *
 * SECURITY: If ADMIN_ALLOWED_EMAILS is not configured, returns 403 (deny all).
 *
 * Usage in API routes:
 *   const rejected = await requireAdmin(request);
 *   if (rejected) return rejected;
 *   // ... proceed with route logic
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  // Check rate limit first (before auth to protect against brute force)
  const rateLimited = checkRateLimit(request, 'admin', ADMIN_RATE_LIMIT);
  if (rateLimited) {
    return rateLimited;
  }

  try {
    // CRITICAL: Cookie name must match the explicit name in config.ts
    // Without this, getToken() silently returns null on Netlify HTTPS
    const token = await getToken({
      req: request,
      cookieName: 'next-auth.session-token',
    });

    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const allowedEmails = getAllowedEmails();

    // SECURITY: If no emails are configured, DENY access (403)
    if (allowedEmails.length === 0) {
      console.error(
        '[AUTH] Access denied: ADMIN_ALLOWED_EMAILS is not configured'
      );
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 403 }
      );
    }

    // Case-insensitive comparison
    const userEmail = (token.email as string).toLowerCase();
    const isAllowed = allowedEmails.includes(userEmail);

    if (!isAllowed) {
      console.warn(`[AUTH] Access denied for ${token.email}: not in allowed list`);
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return null; // Authenticated and authorized — proceed
  } catch {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
