// lib/validations.ts
import { z } from 'zod';

// ============================================================
// GENERIC VALIDATE FUNCTION
// CRITICAL: Must use <S extends z.ZodTypeAny> not z.ZodSchema<T> (Lesson 4)
// ============================================================
export function validate<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown
): z.output<S> {
  return schema.parse(data);
}

// ============================================================
// SERVICE
// ============================================================
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  slug: z.string().optional(),
  icon: z.string().default('Globe'),
  tagline: z.string().default(''),
  description: z.string().default(''),
  highlights: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .default([]),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

// ============================================================
// PRICING PLAN
// ============================================================
export const pricingPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  price: z.number().min(0),
  originalPrice: z.number().nullable().optional(),
  billingFrequency: z.enum(['one-time', 'monthly', 'annual']).default('one-time'),
  features: z.array(z.string()).default([]),
  badge: z.string().nullable().optional(),
  ctaText: z.string().default('Get Started'),
  ctaLink: z.string().default('/contact'),
  order: z.number().default(0),
});

// ============================================================
// PORTFOLIO SITE
// ============================================================
export const portfolioSiteSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  logo: z.string().nullable().optional(), // Sanity asset ID — uploaded separately
  websiteUrl: z.string().url('Must be a valid URL').or(z.literal('')).default(''),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

// ============================================================
// TESTIMONIAL
// ============================================================
export const testimonialSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  quote: z.string().min(1, 'Quote text is required'),
  companyName: z.string().default(''),
  companyUrl: z.string().url().or(z.literal('')).default(''),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

// ============================================================
// LANDING PAGE
// ============================================================
export const landingPageFeatureSchema = z.object({
  icon: z.string().default('Star'),
  title: z.string().min(1),
  description: z.string().default(''),
  screenshot: z.string().nullable().optional(), // Sanity asset ID
});

export const landingPageSchema = z.object({
  pageId: z.enum(['realtors', 'contractors']),
  heroHeadline: z.string().default(''),
  heroSubtitle: z.string().default(''),
  heroImage: z.string().nullable().optional(), // Sanity asset ID
  features: z.array(landingPageFeatureSchema).default([]),
  whiteLabelText: z.string().default(''),
  ctaText: z.string().default('Contact for Quote'),
  ctaLink: z.string().default('/contact'),
});

// ============================================================
// CLIENT
// ============================================================
export const clientSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  contactPerson: z.string().default(''),
  email: z.string().email('Must be a valid email').or(z.literal('')).default(''),
  phone: z.string().default(''),
  billingAddress: z.string().default(''),
  notes: z.string().default(''),
});

// ============================================================
// CATALOG ITEM
// ============================================================
export const catalogItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().default(''),
  unitPrice: z.number().min(0, 'Price must be positive'),
  billingType: z.enum(['one-time', 'monthly', 'annual']).default('one-time'),
  category: z.string().default(''),
});

// ============================================================
// LINE ITEM (shared between quotes and invoices)
// ============================================================
export const lineItemSchema = z.object({
  _key: z.string().optional(),
  name: z.string().min(1),
  description: z.string().default(''),
  qty: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  isTaxExempt: z.boolean().default(false),
  total: z.number().min(0),
});

// ============================================================
// QUOTE
// ============================================================
export const quoteSchema = z.object({
  client: z.string().min(1, 'Client is required'), // Sanity reference ID
  oneTimeItems: z.array(lineItemSchema).default([]),
  recurringItems: z.array(lineItemSchema).default([]),
  oneTimeSubtotal: z.number().default(0),
  monthlySubtotal: z.number().default(0),
  taxEnabled: z.boolean().default(true),
  taxRate: z.number().min(0).max(100).default(8.25),
  texasExemptionEnabled: z.boolean().default(true),
  taxAmount: z.number().default(0),
  grandTotal: z.number().default(0),
  contractTerms: z.string().default(''),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']).default('Draft'),
});

// ============================================================
// INVOICE
// ============================================================
export const invoiceSchema = z.object({
  relatedQuote: z.string().nullable().optional(), // Sanity reference ID
  client: z.string().min(1, 'Client is required'), // Sanity reference ID
  lineItems: z.array(lineItemSchema).default([]),
  subtotal: z.number().default(0),
  taxEnabled: z.boolean().default(true),
  taxRate: z.number().min(0).max(100).default(8.25),
  texasExemptionEnabled: z.boolean().default(true),
  taxAmount: z.number().default(0),
  total: z.number().default(0),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).default('Draft'),
  notes: z.string().default(''),
});

// ============================================================
// SITE SETTINGS
// ============================================================
export const siteSettingsSchema = z.object({
  heroHeadline: z.string().default(''),
  heroSubtitle: z.string().default(''),
  heroCtaText: z.string().default('Get Started'),
  heroCtaLink: z.string().default('/contact'),
  heroImage: z.string().nullable().optional(),
  aboutHeadline: z.string().default(''),
  aboutText: z.string().default(''),
  aboutStats: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .default([]),
  contactPhone: z.string().default(''),
  contactEmail: z.string().default(''),
  contactAddress: z.string().default(''),
  serviceArea: z.string().default(''),
  officeHours: z.string().default(''),
  companyName: z.string().default('daflash'),
  companySpecialty: z.string().default(''),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  socialInstagram: z.string().default(''),
  socialFacebook: z.string().default(''),
  socialLinkedin: z.string().default(''),
  socialYoutube: z.string().default(''),
  defaultContractTerms: z.string().default(''),
});
