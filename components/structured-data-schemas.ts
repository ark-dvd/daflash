// components/structured-data-schemas.ts

const BASE_URL = 'https://daflash.com';

// Homepage — LocalBusiness + WebSite
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#business`,
    name: 'daflash',
    description: 'Professional digital solutions for small businesses. Domain, email, logo, and website setup in 24 hours.',
    url: BASE_URL,
    logo: `${BASE_URL}/images/og-image.png`,
    email: 'contact@daflash.com',
    priceRange: '$200-$500',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    knowsAbout: [
      'Website Design',
      'Domain Registration',
      'Professional Email Setup',
      'Logo Design',
      'Drone Photography',
      'IT Support',
    ],
    sameAs: [],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'daflash',
    url: BASE_URL,
    description: 'Professional digital solutions for small businesses.',
    publisher: {
      '@id': `${BASE_URL}/#business`,
    },
  };
}

// Services page — Service schema for each service
export function getServiceSchema(service: {
  name: string;
  tagline?: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.tagline || service.description || '',
    provider: {
      '@type': 'LocalBusiness',
      name: 'daflash',
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
  };
}

// Wraps multiple services into an array for the services page
export function getServicesPageSchema(services: Array<{
  name: string;
  tagline?: string;
  description?: string;
}>) {
  return services.map((service) => getServiceSchema(service));
}

// Testimonials page — AggregateRating + individual Reviews
export function getTestimonialsSchema(testimonials: Array<{
  clientName: string;
  quote: string;
  companyName?: string;
}>) {
  const reviews = testimonials.map((t) => ({
    '@type': 'Review' as const,
    author: {
      '@type': 'Person' as const,
      name: t.clientName,
    },
    reviewBody: t.quote,
    ...(t.companyName && {
      itemReviewed: {
        '@type': 'Organization' as const,
        name: t.companyName,
      },
    }),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#business`,
    name: 'daflash',
    url: BASE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      bestRating: '5',
      ratingCount: String(testimonials.length),
    },
    review: reviews,
  };
}

// BreadcrumbList for any page
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
