// components/public/MobileNav.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={24} className="text-black" />
        ) : (
          <Menu size={24} className="text-black" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[70px] bg-white z-40">
          <div className="flex flex-col p-6 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-heading text-lg font-medium py-3 px-4 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'text-primary bg-primary-light'
                    : 'text-df-gray-dark hover:bg-df-gray-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="btn bg-primary text-white font-heading font-semibold text-center py-4 rounded-lg mt-4 hover:bg-primary-dark transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
