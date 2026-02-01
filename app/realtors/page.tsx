// app/realtors/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import LucideIcon from '@/components/public/LucideIcon';
import { getLandingPage, getSiteSettings } from '@/lib/data-fetchers';

export const metadata: Metadata = {
  title: 'Websites for Real Estate Agents',
  description: 'A complete white-label digital platform built for realtors. Your brand, your domain, your website — fully managed by you. Property listings, lead capture, deal pipeline, and more.',
  alternates: {
    canonical: '/realtors',
  },
  openGraph: {
    title: 'Websites for Real Estate Agents | daflash',
    description: 'A complete white-label digital platform built for realtors. Your brand, your domain, fully yours.',
    url: '/realtors',
  },
};

export default async function RealtorsPage() {
  const [page, settings] = await Promise.all([
    getLandingPage('realtors'),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-[70px]">
        {/* Hero */}
        <section className="py-24 bg-gradient-to-br from-[#fff5f5] to-white">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="section-tag">Specialization</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold mb-4">
              {page.heroHeadline}
            </h1>
            <p className="text-df-gray text-lg max-w-[700px] mx-auto leading-relaxed">
              {page.heroSubtitle}
            </p>
          </div>
        </section>

        {/* White Label Highlight */}
        <section className="py-0">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border border-primary/20 -mt-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(254,85,87,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(254,85,87,0.1)_0%,transparent_40%)] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block bg-gradient-to-r from-primary to-[#ff8a8b] text-white text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-full mb-5">
                  100% White Label
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-4">
                  Your Brand. Your Domain. Fully Yours.
                </h2>
                <p className="text-white/80 text-lg max-w-[600px] mx-auto leading-relaxed">
                  {page.whiteLabelText}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-primary to-[#ff8a8b] rounded-xl mb-5">
                    <LucideIcon name={feature.icon} size={28} className="text-white" />
                  </div>
                  <h3 className="font-heading text-[17px] font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-df-gray leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-df-gray-light">
          <div className="max-w-[700px] mx-auto px-6 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Ready to Elevate Your Real Estate Brand?
            </h2>
            <p className="text-df-gray text-lg mb-8">
              Get a custom quote for your complete digital platform. Setup fee + monthly subscription.
            </p>
            <Link href={page.ctaLink || '/contact'} className="btn btn-primary">
              {page.ctaText || 'Contact for Quote'}
            </Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
