/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  // CRITICAL: Never ignore build errors or lint warnings
  // TypeScript: strict mode, zero errors policy
  // ESLint: no ignoreDuringBuilds
};

module.exports = nextConfig;
