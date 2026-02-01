// app/admin/page.tsx
// Admin dashboard entry point — shows login state
// The actual admin UI will be built in Phase 5A

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // If middleware let us through but session is missing, redirect to sign in
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
          Welcome to daflash Admin
        </h1>
        <p className="text-gray-500 mb-6">
          Signed in as{' '}
          <span className="font-medium text-gray-700">
            {session.user?.email}
          </span>
        </p>
        <p className="text-sm text-gray-400">
          The full admin dashboard will be available in Phase 5.
        </p>
      </div>
    </div>
  );
}
