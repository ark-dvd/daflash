// components/public/Header.tsx
import Link from 'next/link';
import MobileNav from './MobileNav';

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/realtors', label: 'Realtors' },
  { href: '/contractors', label: 'Contractors' },
  { href: '/testimonials', label: 'Testimonials' },
];

export default function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[70px]">
        {/* Logo - using image file like original site */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-color.svg"
            alt="daflash"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-heading text-[15px] font-medium text-df-gray-dark hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/contact"
              className="btn-primary px-6 py-2.5 text-sm rounded-md font-heading font-semibold text-white bg-primary hover:bg-primary-dark transition-all"
            >
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Mobile Nav */}
        <MobileNav links={navLinks} />
      </div>
    </nav>
  );
}
