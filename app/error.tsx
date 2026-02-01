// app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error — could be sent to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        {/* Error icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-4">
          Something Went Wrong
        </h1>
        <p className="text-df-gray mb-8 text-lg">
          An unexpected error occurred. Please try again or contact us if the problem persists.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-heading font-semibold rounded-lg border-2 border-black hover:bg-black hover:text-white transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
