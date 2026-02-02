// lib/auth/config.ts
// NextAuth configuration with Google OAuth
// CRITICAL: Explicit cookie name prevents Netlify HTTPS auth failures

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * Get allowed admin emails from environment variable.
 * SECURITY: If ADMIN_ALLOWED_EMAILS is not set or empty, NO ONE can sign in.
 * This is a security-first approach — never default to "allow all".
 */
function getAllowedEmails(): string[] {
  const envValue = process.env.ADMIN_ALLOWED_EMAILS;
  if (!envValue || envValue.trim() === '') {
    return [];
  }
  return envValue.split(',').map((email) => email.trim().toLowerCase());
}

// Production startup validation
if (process.env.NODE_ENV === 'production') {
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl || nextAuthUrl.includes('localhost')) {
    console.error(
      '[AUTH ERROR] NEXTAUTH_URL is not set or contains localhost in production. ' +
      'Set NEXTAUTH_URL=https://daflash.com in your environment variables.'
    );
  }

  const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS;
  if (!allowedEmails || allowedEmails.trim() === '') {
    console.error(
      '[AUTH ERROR] ADMIN_ALLOWED_EMAILS is not set. ' +
      'No one will be able to access the admin panel. ' +
      'Set ADMIN_ALLOWED_EMAILS=email@example.com in your environment variables.'
    );
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],

  // CRITICAL: Use JWT strategy, NOT database sessions
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // CRITICAL: Explicit cookie configuration
  // Without this, Netlify HTTPS deployments silently fail
  // because NextAuth adds __Secure- prefix automatically
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    // SECURITY: Check if the user's email is in the whitelist
    // If ADMIN_ALLOWED_EMAILS is empty or not set, DENY ALL sign-ins
    async signIn({ user }) {
      if (!user.email) return false;

      const allowedEmails = getAllowedEmails();

      // SECURITY: If no emails are configured, DENY sign-in (not allow)
      if (allowedEmails.length === 0) {
        console.warn(
          `[AUTH] Sign-in denied for ${user.email}: ADMIN_ALLOWED_EMAILS is not configured`
        );
        return false;
      }

      // Case-insensitive comparison
      const userEmail = user.email.toLowerCase();
      const isAllowed = allowedEmails.includes(userEmail);

      if (!isAllowed) {
        console.warn(`[AUTH] Sign-in denied for ${user.email}: not in allowed list`);
        return false;
      }

      return true;
    },

    // Include email in the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    // Include email in the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  // DO NOT set pages.signIn to /admin - this causes redirect loops!
  // Let NextAuth handle its own sign-in flow at /api/auth/signin
};
