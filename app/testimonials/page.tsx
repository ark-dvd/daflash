// app/testimonials/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import StructuredData from '@/components/StructuredData';
import { getTestimonialsSchema } from '@/components/structured-data-schemas';
import { getActiveTestimonials, getSiteSettings } from '@/lib/data-fetchers';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'What our clients say about working with daflash. Real reviews from real businesses we\'ve helped grow online.',
  alternates: {
    canonical: '/testimonials',
  },
  openGraph: {
    title: 'Testimonials | daflash',
    description: 'What our clients say about working with daflash. Real reviews from real businesses.',
    url: '/testimonials',
  },
};

export default async function TestimonialsPage() {
  const [testimonials, settings] = await Promise.all([
    getActiveTestimonials(),
    getSiteSettings(),
  ]);

  // Sort: featured first
  const sorted = [...testimonials].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  return (
    <>
      <StructuredData data={getTestimonialsSchema(testimonials.map(t => ({
        clientName: t.clientName,
        quote: t.quote,
        companyName: t.companyName,
      })))} />
      <Header />
      <main className="pt-[70px]">
        {/* Page Header */}
        <section className="py-20 bg-black">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="section-tag">Testimonials</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-4">
              What Our Clients Say
            </h1>
            <p className="text-df-gray text-lg max-w-[600px] mx-auto">
              Real feedback from real businesses we&apos;ve helped go digital.
            </p>
          </div>
        </section>

        {/* Testimonials Grid - 2 columns on desktop */}
        <section className="py-24">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {sorted.map((t) => (
                <div
                  key={t._id}
                  className="relative bg-white border border-black/[0.08] rounded-2xl p-8 transition-all hover:shadow-md"
                >
                  {t.isFeatured && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 bg-primary-light text-primary text-xs font-heading font-bold px-3 py-1 rounded-full">
                      <Star size={12} className="fill-primary" /> Featured
                    </span>
                  )}
                  <span className="block font-serif text-5xl text-primary opacity-30 leading-none mb-4">
                    &ldquo;
                  </span>
                  <p className="text-df-gray-dark text-[1.05rem] leading-relaxed italic mb-6">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-df-gray-light flex items-center justify-center">
                      <span className="font-heading font-bold text-sm text-primary">
                        {t.clientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm">{t.clientName}</p>
                      {t.companyName && (
                        <p className="text-df-gray text-sm">
                          {t.companyUrl ? (
                            <a href={t.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                              {t.companyName}
                            </a>
                          ) : (
                            t.companyName
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-df-gray-light">
          <div className="max-w-[700px] mx-auto px-6 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">Join Our Happy Clients</h2>
            <p className="text-df-gray text-lg mb-8">
              Ready to experience the daflash difference? Let&apos;s build something great together.
            </p>
            <Link href="/contact" className="btn btn-primary">Get Started</Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
