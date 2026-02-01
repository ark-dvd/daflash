// app/api/auth/[...nextauth]/route.ts
// NextAuth API route handler
// Handles: /api/auth/signin, /api/auth/signout, /api/auth/callback, /api/auth/session

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
