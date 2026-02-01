// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        {/* Large 404 number */}
        <h1 className="font-heading text-[120px] sm:text-[160px] font-extrabold leading-none text-df-gray-light select-none">
          404
        </h1>

        {/* Message */}
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-black -mt-4 mb-4">
          Page Not Found
        </h2>
        <p className="text-df-gray mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-heading font-semibold rounded-lg border-2 border-black hover:bg-black hover:text-white transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
