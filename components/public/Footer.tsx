// components/public/Footer.tsx
import Link from 'next/link';
import { Zap, Mail, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import type { SiteSettings } from '@/schemas';

interface FooterProps {
  settings: SiteSettings;
}

const footerLinks = [
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/realtors', label: 'Realtors' },
  { href: '/contractors', label: 'Contractors' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hasSocials = settings.socialInstagram || settings.socialFacebook || settings.socialLinkedin || settings.socialYoutube;

  return (
    <footer className="bg-black py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <Zap size={28} className="text-primary fill-primary" />
            <span className="font-heading text-2xl font-bold text-white">
              daflash
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-df-gray hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex items-center gap-2 text-df-gray hover:text-white transition-colors"
            >
              <Mail size={16} />
              <span className="text-sm">{settings.contactEmail}</span>
            </a>
          )}

          {/* Social Media */}
          {hasSocials && (
            <div className="flex items-center gap-4">
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-df-gray hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-df-gray hover:text-white transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {settings.socialLinkedin && (
                <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-df-gray hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
              {settings.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-df-gray hover:text-white transition-colors">
                  <Youtube size={20} />
                </a>
              )}
            </div>
          )}

          {/* Copyright */}
          <p className="text-[13px] text-df-gray">
            &copy; {currentYear} {settings.companyName || 'daflash'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
