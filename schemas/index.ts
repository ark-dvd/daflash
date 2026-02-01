// schemas/index.ts
// TypeScript type definitions for all daflash entities
// These define the shape of documents stored in Sanity

export interface Service {
  _id: string;
  _type: 'service';
  name: string;
  slug: string;
  icon: string;        // Lucide icon name (e.g., 'Globe', 'Mail', 'Star', 'Monitor')
  tagline: string;
  description: string;
  highlights: { title: string; description: string }[];
  order: number;
  isActive: boolean;
}

export interface PricingPlan {
  _id: string;
  _type: 'pricingPlan';
  name: string;
  price: number;
  originalPrice?: number;
  billingFrequency: 'one-time' | 'monthly' | 'annual';
  features: string[];
  badge?: string;
  ctaText: string;
  ctaLink: string;
  order: number;
}

export interface PortfolioSite {
  _id: string;
  _type: 'portfolioSite';
  clientName: string;
  logo?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  websiteUrl: string;
  order: number;
  isActive: boolean;
}

export interface Testimonial {
  _id: string;
  _type: 'testimonial';
  clientName: string;
  quote: string;
  companyName?: string;
  companyUrl?: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
}

export interface LandingPageFeature {
  icon: string;
  title: string;
  description: string;
  screenshot?: {
    asset: {
      _id: string;
      url: string;
    };
  };
}

export interface LandingPage {
  _id: string;
  _type: 'landingPage';
  pageId: 'realtors' | 'contractors';
  heroHeadline: string;
  heroSubtitle: string;
  heroImage?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  features: LandingPageFeature[];
  whiteLabelText: string;
  ctaText: string;
  ctaLink: string;
}

export interface Client {
  _id: string;
  _type: 'client';
  clientName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  notes?: string;
}

export interface CatalogItem {
  _id: string;
  _type: 'catalogItem';
  name: string;
  description?: string;
  unitPrice: number;
  billingType: 'one-time' | 'monthly' | 'annual';
  category?: string;
}

export interface LineItem {
  _key?: string;
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
  discount?: number;       // Percentage 0-100 (optional, defaults to 0)
  isTaxExempt?: boolean;   // If true, no tax on this item
  total: number;           // After discount: unitPrice * qty * (1 - discount/100)
}

export interface Quote {
  _id: string;
  _type: 'quote';
  quoteNumber: string;
  client: Client;                // Expanded reference
  oneTimeItems: LineItem[];
  recurringItems: LineItem[];
  oneTimeSubtotal: number;       // Sum of all one-time item totals (after discounts)
  monthlySubtotal: number;       // Sum of all recurring item totals (after discounts)
  // Tax fields
  taxEnabled: boolean;           // Global toggle: is tax applied to this quote?
  taxRate: number;               // e.g., 8.25
  texasExemptionEnabled: boolean; // 20% data processing exemption (tax on 80% only)
  taxAmount: number;             // Calculated total tax
  grandTotal: number;            // oneTimeSubtotal + taxAmount (for one-time portion)
  // Terms and status
  contractTerms?: string;
  expiryDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  createdAt: string;
  sentAt?: string;
}

export interface Invoice {
  _id: string;
  _type: 'invoice';
  invoiceNumber: string;
  relatedQuote?: { _id: string; quoteNumber: string }; // Expanded reference
  client: Client;                // Expanded reference
  lineItems: LineItem[];
  subtotal: number;              // Sum of all line item totals (after discounts)
  // Tax fields
  taxEnabled: boolean;           // Global toggle
  taxRate: number;               // e.g., 8.25
  texasExemptionEnabled: boolean;
  taxAmount: number;             // Calculated total tax
  // End tax fields
  total: number;                 // subtotal + taxAmount
  issueDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
}

export interface SiteStat {
  value: string;
  label: string;
}

export interface SiteSettings {
  _id: string;
  _type: 'siteSettings';
  // Hero
  heroHeadline: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImage?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  // About
  aboutHeadline?: string;
  aboutText?: string;
  aboutStats?: SiteStat[];
  // Contact
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  serviceArea?: string;
  officeHours?: string;
  // Branding
  companyName: string;
  companySpecialty?: string;
  logo?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  favicon?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  // Social
  socialInstagram?: string;
  socialFacebook?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  // Contract Terms (default template for quotes)
  defaultContractTerms?: string;
}
