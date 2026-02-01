// lib/auth/middleware.ts
// Helper function to protect API routes — validates JWT and checks email whitelist
// Used in every /api/admin/* route

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Same whitelist as config.ts — keep in sync
const ALLOWED_EMAILS: string[] = [
  // Add your admin email(s) here:
  // 'admin@daflash.com',
  // 'your.email@gmail.com',
];

/**
 * Validates that the request comes from an authenticated admin user.
 * Returns NextResponse with 401 if not authenticated, or null if valid.
 *
 * Usage in API routes:
 *   const rejected = await requireAdmin(request);
 *   if (rejected) return rejected;
 *   // ... proceed with route logic
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
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

    // Check email whitelist (skip if no emails configured)
    if (
      ALLOWED_EMAILS.length > 0 &&
      !ALLOWED_EMAILS.includes(token.email as string)
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return null; // Authenticated — proceed
  } catch {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
