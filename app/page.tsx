// app/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import LucideIcon from '@/components/public/LucideIcon';
import StructuredData from '@/components/StructuredData';
import { getLocalBusinessSchema, getWebSiteSchema } from '@/components/structured-data-schemas';
import {
  getActiveServices,
  getFeaturedTestimonials,
  getActivePortfolioSites,
  getSiteSettings,
} from '@/lib/data-fetchers';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const [services, testimonials, portfolio, settings] = await Promise.all([
    getActiveServices(),
    getFeaturedTestimonials(),
    getActivePortfolioSites(),
    getSiteSettings(),
  ]);

  return (
    <>
      <StructuredData data={[getLocalBusinessSchema(), getWebSiteSchema()]} />
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-[120px] pb-20 overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-df-gray-light to-primary-light opacity-50 clip-hero hidden md:block" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="md:text-left text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-heading font-extrabold tracking-tight mb-6 leading-[1.1]">
              Domain. Email. Website.<br />
              <span className="text-primary">In 24 Hours.</span>
            </h1>
            <p className="text-lg text-df-gray mb-9 max-w-[480px] md:mx-0 mx-auto">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 md:justify-start justify-center">
              <Link href={settings.heroCtaLink || '/contact'} className="btn btn-primary">
                {settings.heroCtaText || 'Get Started'}
              </Link>
              <Link href="/services" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </div>

          {/* Visual - Custom lightning bolt SVG from daflash logo */}
          <div className="flex justify-center items-center order-first md:order-last">
            {/* Desktop: shift right with ml-16, Mobile: centered */}
            <div className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] md:ml-16 flex items-center justify-center">
              {/* Desktop size - 380px with scaleX(-1) mirroring preserved in animation */}
              <svg
                className="hidden md:block w-[380px] h-[380px] drop-shadow-[0_20px_40px_rgba(254,85,87,0.3)] animate-float-mirrored"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="68.2,36.6 95.1,9.1 50.6,38.2 63.5,44.4 22.4,73.9 12.1,67.3 5.1,92.9 46.6,89.7 33,80.7 83.9,43.6"
                  fill="#fe5557"
                />
              </svg>
              {/* Mobile size - centered, mirrored animation */}
              <svg
                className="md:hidden w-[160px] h-[160px] drop-shadow-[0_20px_40px_rgba(254,85,87,0.3)] animate-float-mirrored"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="68.2,36.6 95.1,9.1 50.6,38.2 63.5,44.4 22.4,73.9 12.1,67.3 5.1,92.9 46.6,89.7 33,80.7 83.9,43.6"
                  fill="#fe5557"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-df-gray">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary to-transparent animate-pulse" />
        </div>
      </section>

      {/* ===== SERVICES OVERVIEW ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="section-tag">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">What We Do</h2>
            <p className="text-df-gray text-lg">
              Professional digital solutions for businesses that want to look their best online.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service) => (
              <Link
                key={service._id}
                href="/services"
                className="group bg-white border border-black/[0.08] rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-transparent"
              >
                <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-xl">
                  <LucideIcon name={service.icon} size={28} className="text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-3">{service.name}</h3>
                <p className="text-sm text-df-gray leading-relaxed">{service.tagline}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-semibold font-heading group-hover:gap-2 transition-all">
                  Learn More <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-black">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <span className="section-tag">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Trusted by Growing Businesses
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.slice(0, 4).map((t) => (
                <div
                  key={t._id}
                  className="bg-white/5 rounded-2xl p-8 text-center"
                >
                  <span className="block font-serif text-6xl text-primary opacity-50 leading-none mb-4">
                    &ldquo;
                  </span>
                  <p className="text-white text-[1.05rem] leading-relaxed italic mb-8">
                    {t.quote}
                  </p>
                  <div>
                    <p className="font-heading font-bold text-white">{t.clientName}</p>
                    {t.companyName && (
                      <p className="text-df-gray text-sm">
                        {t.companyUrl ? (
                          <a href={t.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            {t.companyName}
                          </a>
                        ) : (
                          t.companyName
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/testimonials" className="inline-flex items-center gap-2 text-df-gray hover:text-white transition-colors font-heading font-semibold text-sm">
                See All Testimonials <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== PORTFOLIO ===== */}
      {portfolio.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-[600px] mx-auto mb-16">
              <span className="section-tag">Our Clients</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Websites We&apos;ve Built
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {portfolio.map((site) => (
                <a
                  key={site._id}
                  href={site.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-24 bg-df-gray-light rounded-xl px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white group"
                  title={site.clientName}
                >
                  {site.logo?.asset?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={site.logo.asset.url}
                      alt={site.clientName}
                      className="max-h-10 max-w-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    />
                  ) : (
                    <span className="font-heading text-sm font-semibold text-df-gray-dark text-center">
                      {site.clientName}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-df-gray hover:text-primary transition-colors font-heading font-semibold text-sm">
                See All Our Work <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA BANNER ===== */}
      <section className="py-20 bg-df-gray-light">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-df-gray text-lg mb-8">
            Tell us about your business and we&apos;ll get back to you within 24 hours with a plan to elevate your digital presence.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Contact Us
          </Link>
        </div>
      </section>

      <Footer settings={settings} />
    </>
  );
}
