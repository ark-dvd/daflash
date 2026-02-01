// app/pricing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getPricingPlans, getSiteSettings } from '@/lib/data-fetchers';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent pricing for professional websites, email setup, and drone services. Starting from $200. No hidden fees.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing | daflash',
    description: 'Transparent pricing for professional websites, email setup, and drone services. Starting from $200.',
    url: '/pricing',
  },
};

export default async function PricingPage() {
  const [plans, settings] = await Promise.all([
    getPricingPlans(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-[70px]">
        {/* Page Header */}
        <section className="py-20 bg-df-gray-light">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="section-tag">Pricing</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-df-gray text-lg max-w-[600px] mx-auto">
              No hidden fees. No surprises. Just straightforward pricing for quality services.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="relative bg-df-gray-light rounded-2xl p-10 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:bg-white group"
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-heading font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-bold mb-6">{plan.name}</h3>
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <span className="block text-df-gray text-sm line-through mb-1">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="block text-sm text-df-gray mb-1">from</span>
                    <span className="font-heading text-5xl font-extrabold text-primary">
                      ${plan.price}
                    </span>
                    {plan.billingFrequency !== 'one-time' && (
                      <span className="block text-sm text-df-gray mt-1">
                        /{plan.billingFrequency === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                  <ul className="text-left mb-8 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-df-gray">
                        <Check size={18} className="text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.ctaLink || '/contact'}
                    className="btn btn-primary w-full"
                  >
                    {plan.ctaText || 'Get Started'}
                  </Link>
                </div>
              ))}
            </div>

            {/* Platform CTA */}
            <div className="mt-16 bg-gradient-to-br from-black to-df-gray-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(254,85,87,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(254,85,87,0.1)_0%,transparent_40%)] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block bg-gradient-to-r from-primary to-[#ff8a8b] text-white text-sm font-bold uppercase tracking-wider px-6 py-2 rounded-full mb-6">
                  Custom Platforms
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-4">
                  Need a Full Digital Platform?
                </h2>
                <p className="text-white/80 text-lg max-w-[500px] mx-auto mb-8 leading-relaxed">
                  We build complete white-label platforms for real estate agents and contractors. Custom quote with setup fee + monthly subscription.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/realtors" className="btn btn-primary">
                    For Realtors
                  </Link>
                  <Link href="/contractors" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all px-8 py-3.5 font-heading font-semibold rounded-lg">
                    For Contractors
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
