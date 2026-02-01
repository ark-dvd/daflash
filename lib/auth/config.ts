// lib/auth/config.ts
// NextAuth configuration with Google OAuth
// CRITICAL: Explicit cookie name prevents Netlify HTTPS auth failures

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Whitelist of allowed admin emails
// Only these Google accounts can access /admin
const ALLOWED_EMAILS: string[] = [
  // Add your admin email(s) here:
  // 'admin@daflash.com',
  // 'your.email@gmail.com',
];

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
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    // Check if the user's email is in the whitelist
    async signIn({ user }) {
      if (!user.email) return false;
      // If no emails are whitelisted, allow all (development convenience)
      if (ALLOWED_EMAILS.length === 0) return true;
      return ALLOWED_EMAILS.includes(user.email);
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

  pages: {
    signIn: '/admin',
    error: '/admin',
  },
};
