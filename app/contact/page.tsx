// app/contact/page.tsx
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ContactForm from '@/components/public/ContactForm';
import { getSiteSettings } from '@/lib/data-fetchers';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with daflash. Tell us about your business and we\'ll get back to you within 24 hours.',
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="pt-[70px]">
        {/* Contact Section */}
        <section className="py-24 bg-df-gray-light">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Left - Info */}
              <div>
                <span className="section-tag">Get in Touch</span>
                <h1 className="text-3xl sm:text-4xl font-heading font-extrabold mb-4">
                  Ready to Get Started?
                </h1>
                <p className="text-df-gray text-lg leading-relaxed mb-10">
                  Tell us about your business and we&apos;ll get back to you within 24 hours with a plan to elevate your digital presence.
                </p>

                <div className="flex flex-col gap-5">
                  {settings.contactEmail && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                        <Mail size={20} className="text-primary" />
                      </div>
                      <a href={`mailto:${settings.contactEmail}`} className="font-medium hover:text-primary transition-colors">
                        {settings.contactEmail}
                      </a>
                    </div>
                  )}
                  {settings.contactPhone && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                        <Phone size={20} className="text-primary" />
                      </div>
                      <a href={`tel:${settings.contactPhone}`} className="font-medium hover:text-primary transition-colors">
                        {settings.contactPhone}
                      </a>
                    </div>
                  )}
                  {settings.contactAddress && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                        <MapPin size={20} className="text-primary" />
                      </div>
                      <span className="text-df-gray-dark">{settings.contactAddress}</span>
                    </div>
                  )}
                  {settings.officeHours && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                        <Clock size={20} className="text-primary" />
                      </div>
                      <span className="text-df-gray-dark">{settings.officeHours}</span>
                    </div>
                  )}
                  {settings.serviceArea && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                        <MapPin size={20} className="text-primary" />
                      </div>
                      <span className="text-df-gray text-sm">Service Area: {settings.serviceArea}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Form */}
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
