// app/portfolio/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getActivePortfolioSites, getSiteSettings } from '@/lib/data-fetchers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'See the websites we\'ve built for our clients. Professional, fast, and tailored to each business.',
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    title: 'Portfolio | daflash',
    description: 'See the websites we\'ve built for our clients. Professional, fast, and tailored to each business.',
    url: '/portfolio',
  },
};

export default async function PortfolioPage() {
  const [sites, settings] = await Promise.all([
    getActivePortfolioSites(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-[70px]">
        {/* Page Header */}
        <section className="py-20 bg-df-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="section-tag">Portfolio</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold mb-4">
              Websites We&apos;ve Built
            </h1>
            <p className="text-df-gray text-lg max-w-[600px] mx-auto">
              Every site is built with care, speed, and attention to detail. Click any logo to see it live.
            </p>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sites.map((site) => (
                <a
                  key={site._id}
                  href={site.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center bg-df-gray-light rounded-2xl p-8 h-40 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:bg-white"
                >
                  {site.logo?.asset?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={site.logo.asset.url}
                      alt={site.clientName}
                      className="max-h-12 max-w-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  ) : (
                    <span className="font-heading text-lg font-bold text-df-gray-dark">
                      {site.clientName}
                    </span>
                  )}
                  <span className="flex items-center gap-1 mt-4 text-xs text-df-gray group-hover:text-primary transition-colors">
                    Visit Site <ExternalLink size={12} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-df-gray-light">
          <div className="max-w-[700px] mx-auto px-6 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">Want to Be Next?</h2>
            <p className="text-df-gray text-lg mb-8">
              Join our growing list of happy clients. Your website could be ready in 24 hours.
            </p>
            <Link href="/contact" className="btn btn-primary">Get Started</Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
