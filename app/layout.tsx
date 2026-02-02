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
  metadataBase: new URL('https://daflash.com'),
  title: {
    default: 'daflash | Build Your Online Presence Fast',
    template: '%s | daflash',
  },
  description: 'Professional digital solutions for small businesses. Domain, email, logo, and website setup in 24 hours. Plus ongoing IT support.',
  keywords: ['website design', 'professional email setup', 'domain registration', 'logo design', 'IT support', 'drone photography', 'small business solutions'],
  authors: [{ name: 'daflash' }],
  creator: 'daflash',
  icons: {
    icon: '/images/logo-color.svg',
    apple: '/images/logo-color.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://daflash.com',
    siteName: 'daflash',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'daflash - Build Your Online Presence Fast',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
