// app/services/page.tsx
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import LucideIcon from '@/components/public/LucideIcon';
import { getActiveServices, getSiteSettings } from '@/lib/data-fetchers';

export const metadata = {
  title: 'Services',
  description: 'Professional digital solutions - website design, domain registration, professional email, drone photography, and IT support.',
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getActiveServices(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-[70px]">
        {/* Page Header */}
        <section className="py-20 bg-df-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="section-tag">Our Services</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold mb-4">
              What We Offer
            </h1>
            <p className="text-df-gray text-lg max-w-[600px] mx-auto">
              Professional digital solutions for businesses of all sizes. From a quick website to a full digital platform.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col gap-16">
              {services.map((service, index) => (
                <div
                  key={service._id}
                  className={`grid md:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'md:direction-rtl' : ''
                  }`}
                >
                  {/* Info Side */}
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-6">
                      <LucideIcon name={service.icon} size={32} className="text-white" />
                    </div>
                    <span className="section-tag">{service.tagline}</span>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
                      {service.name}
                    </h2>
                    <p className="text-df-gray leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <Link href="/contact" className="btn btn-primary text-sm">
                      Get Started
                    </Link>
                  </div>

                  {/* Highlights Side */}
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="grid gap-4">
                      {service.highlights.map((highlight, hIdx) => (
                        <div
                          key={hIdx}
                          className="bg-df-gray-light rounded-xl p-6 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <span className="font-heading text-3xl font-extrabold text-primary/10 leading-none">
                              {String(hIdx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="font-heading font-bold mb-1">{highlight.title}</h3>
                              <p className="text-sm text-df-gray leading-relaxed">
                                {highlight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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
            <h2 className="text-3xl font-heading font-bold mb-4">Not Sure What You Need?</h2>
            <p className="text-df-gray text-lg mb-8">
              Tell us about your business and we&apos;ll recommend the right solution for you.
            </p>
            <Link href="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
