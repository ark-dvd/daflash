// lib/data-fetchers.ts
import { sanityClient, isSanityConfigured } from './sanity';
import type {
  Service,
  PricingPlan,
  PortfolioSite,
  Testimonial,
  LandingPage,
  SiteSettings,
  Client,
  CatalogItem,
  Quote,
  Invoice,
} from '@/schemas';
import {
  demoServices,
  demoPricingPlans,
  demoPortfolioSites,
  demoTestimonials,
  demoRealtorsPage,
  demoContractorsPage,
  demoSiteSettings,
  demoClients,
  demoCatalogItems,
  demoQuotes,
  demoInvoices,
} from './demo-data';

// ============================================================
// SERVICES
// ============================================================
export async function getServices(): Promise<Service[]> {
  if (!isSanityConfigured()) return demoServices;
  try {
    const services = await sanityClient.fetch<Service[]>(
      `*[_type == "service"] | order(order asc) {
        _id, _type, name, slug, icon, tagline, description, highlights, order, isActive
      }`
    );
    return services.length > 0 ? services : demoServices;
  } catch {
    return demoServices;
  }
}

export async function getActiveServices(): Promise<Service[]> {
  const services = await getServices();
  return services.filter((s) => s.isActive);
}

export async function getService(slug: string): Promise<Service | null> {
  if (!isSanityConfigured()) {
    return demoServices.find((s) => s.slug === slug) || null;
  }
  try {
    const service = await sanityClient.fetch<Service | null>(
      `*[_type == "service" && slug == $slug][0] {
        _id, _type, name, slug, icon, tagline, description, highlights, order, isActive
      }`,
      { slug }
    );
    return service || demoServices.find((s) => s.slug === slug) || null;
  } catch {
    return demoServices.find((s) => s.slug === slug) || null;
  }
}

// ============================================================
// PRICING
// ============================================================
export async function getPricingPlans(): Promise<PricingPlan[]> {
  if (!isSanityConfigured()) return demoPricingPlans;
  try {
    const plans = await sanityClient.fetch<PricingPlan[]>(
      `*[_type == "pricingPlan"] | order(order asc) {
        _id, _type, name, price, originalPrice, billingFrequency,
        features, badge, ctaText, ctaLink, order
      }`
    );
    return plans.length > 0 ? plans : demoPricingPlans;
  } catch {
    return demoPricingPlans;
  }
}

// ============================================================
// PORTFOLIO
// ============================================================
export async function getPortfolioSites(): Promise<PortfolioSite[]> {
  if (!isSanityConfigured()) return demoPortfolioSites;
  try {
    const sites = await sanityClient.fetch<PortfolioSite[]>(
      `*[_type == "portfolioSite"] | order(order asc) {
        _id, _type, clientName, "logo": logo { asset->{ _id, url } },
        websiteUrl, order, isActive
      }`
    );
    return sites.length > 0 ? sites : demoPortfolioSites;
  } catch {
    return demoPortfolioSites;
  }
}

export async function getActivePortfolioSites(): Promise<PortfolioSite[]> {
  const sites = await getPortfolioSites();
  return sites.filter((s) => s.isActive);
}

// ============================================================
// TESTIMONIALS
// ============================================================
export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSanityConfigured()) return demoTestimonials;
  try {
    const testimonials = await sanityClient.fetch<Testimonial[]>(
      `*[_type == "testimonial"] | order(order asc) {
        _id, _type, clientName, quote, companyName, companyUrl,
        isFeatured, order, isActive
      }`
    );
    return testimonials.length > 0 ? testimonials : demoTestimonials;
  } catch {
    return demoTestimonials;
  }
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  if (!isSanityConfigured()) {
    return demoTestimonials.filter((t) => t.isFeatured);
  }
  try {
    const testimonials = await sanityClient.fetch<Testimonial[]>(
      `*[_type == "testimonial" && isFeatured == true && isActive == true] | order(order asc) {
        _id, _type, clientName, quote, companyName, companyUrl,
        isFeatured, order, isActive
      }`
    );
    return testimonials.length > 0
      ? testimonials
      : demoTestimonials.filter((t) => t.isFeatured);
  } catch {
    return demoTestimonials.filter((t) => t.isFeatured);
  }
}

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  const testimonials = await getTestimonials();
  return testimonials.filter((t) => t.isActive);
}

// ============================================================
// LANDING PAGES
// ============================================================
export async function getLandingPage(
  pageId: 'realtors' | 'contractors'
): Promise<LandingPage> {
  const fallback = pageId === 'realtors' ? demoRealtorsPage : demoContractorsPage;
  if (!isSanityConfigured()) return fallback;
  try {
    const page = await sanityClient.fetch<LandingPage | null>(
      `*[_type == "landingPage" && pageId == $pageId][0] {
        _id, _type, pageId, heroHeadline, heroSubtitle,
        "heroImage": heroImage { asset->{ _id, url } },
        features[] { icon, title, description, "screenshot": screenshot { asset->{ _id, url } } },
        whiteLabelText, ctaText, ctaLink
      }`,
      { pageId }
    );
    return page || fallback;
  } catch {
    return fallback;
  }
}

// ============================================================
// SITE SETTINGS
// ============================================================
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured()) return demoSiteSettings;
  try {
    const settings = await sanityClient.fetch<SiteSettings | null>(
      `*[_type == "siteSettings"][0] {
        _id, _type,
        heroHeadline, heroSubtitle, heroCtaText, heroCtaLink,
        "heroImage": heroImage { asset->{ _id, url } },
        aboutHeadline, aboutText, aboutStats,
        contactPhone, contactEmail, contactAddress, serviceArea, officeHours,
        companyName, companySpecialty,
        "logo": logo { asset->{ _id, url } },
        "favicon": favicon { asset->{ _id, url } },
        socialInstagram, socialFacebook, socialLinkedin, socialYoutube,
        defaultContractTerms
      }`
    );
    return settings || demoSiteSettings;
  } catch {
    return demoSiteSettings;
  }
}

// ============================================================
// CLIENTS
// ============================================================
export async function getClients(): Promise<Client[]> {
  if (!isSanityConfigured()) return demoClients;
  try {
    const clients = await sanityClient.fetch<Client[]>(
      `*[_type == "client"] | order(clientName asc) {
        _id, _type, clientName, contactPerson, email, phone, billingAddress, notes
      }`
    );
    return clients;
  } catch {
    return demoClients;
  }
}

export async function getClient(id: string): Promise<Client | null> {
  if (!isSanityConfigured()) return null;
  try {
    const client = await sanityClient.fetch<Client | null>(
      `*[_type == "client" && _id == $id][0] {
        _id, _type, clientName, contactPerson, email, phone, billingAddress, notes
      }`,
      { id }
    );
    return client;
  } catch {
    return null;
  }
}

// ============================================================
// CATALOG
// ============================================================
export async function getCatalogItems(): Promise<CatalogItem[]> {
  if (!isSanityConfigured()) return demoCatalogItems;
  try {
    const items = await sanityClient.fetch<CatalogItem[]>(
      `*[_type == "catalogItem"] | order(category asc, name asc) {
        _id, _type, name, description, unitPrice, billingType, category
      }`
    );
    return items;
  } catch {
    return demoCatalogItems;
  }
}

// ============================================================
// QUOTES
// ============================================================
export async function getQuotes(): Promise<Quote[]> {
  if (!isSanityConfigured()) return demoQuotes;
  try {
    const quotes = await sanityClient.fetch<Quote[]>(
      `*[_type == "quote"] | order(createdAt desc) {
        _id, _type, quoteNumber,
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        oneTimeItems, recurringItems,
        oneTimeSubtotal, monthlySubtotal,
        contractTerms, expiryDate, status, createdAt, sentAt
      }`
    );
    return quotes;
  } catch {
    return demoQuotes;
  }
}

export async function getQuote(id: string): Promise<Quote | null> {
  if (!isSanityConfigured()) return null;
  try {
    const quote = await sanityClient.fetch<Quote | null>(
      `*[_type == "quote" && _id == $id][0] {
        _id, _type, quoteNumber,
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        oneTimeItems, recurringItems,
        oneTimeSubtotal, monthlySubtotal,
        contractTerms, expiryDate, status, createdAt, sentAt
      }`,
      { id }
    );
    return quote;
  } catch {
    return null;
  }
}

// ============================================================
// INVOICES
// ============================================================
export async function getInvoices(): Promise<Invoice[]> {
  if (!isSanityConfigured()) return demoInvoices;
  try {
    const invoices = await sanityClient.fetch<Invoice[]>(
      `*[_type == "invoice"] | order(issueDate desc) {
        _id, _type, invoiceNumber,
        "relatedQuote": relatedQuote->{ _id, quoteNumber },
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        lineItems, subtotal, tax, discount, discountType, total,
        issueDate, dueDate, status, notes
      }`
    );
    return invoices;
  } catch {
    return demoInvoices;
  }
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (!isSanityConfigured()) return null;
  try {
    const invoice = await sanityClient.fetch<Invoice | null>(
      `*[_type == "invoice" && _id == $id][0] {
        _id, _type, invoiceNumber,
        "relatedQuote": relatedQuote->{ _id, quoteNumber },
        "client": client->{ _id, _type, clientName, contactPerson, email, phone, billingAddress, notes },
        lineItems, subtotal, tax, discount, discountType, total,
        issueDate, dueDate, status, notes
      }`,
      { id }
    );
    return invoice;
  } catch {
    return null;
  }
}
