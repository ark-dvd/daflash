// app/layout.tsx
import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'daflash | Build Your Online Presence Fast',
    template: '%s | daflash',
  },
  description:
    'Professional digital solutions for small businesses. Domain, email, logo, and website setup in 24 hours.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakartaSans.variable}`}>
      <head>
        {/* GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QPL4VWSV8G"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-QPL4VWSV8G');`}
        </Script>
      </head>
      <body className="font-body text-df-gray-dark bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
