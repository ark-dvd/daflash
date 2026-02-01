// lib/demo-data.ts
// Demo data with real daflash content from the current site
// Used when Sanity is not configured or returns empty results

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

// ============================================================
// SERVICES — Real daflash service offerings
// ============================================================
export const demoServices: Service[] = [
  {
    _id: 'demo-service-1',
    _type: 'service',
    name: 'Online Presence',
    slug: 'online-presence',
    icon: 'Globe',
    tagline: 'Your Business, Ready to Impress',
    description: 'From zero to professional in 4 simple steps. No technical knowledge required. We help you choose and secure the perfect domain name, set up professional email with Google Workspace or Office 365, design a custom logo, and launch a professional website.',
    highlights: [
      { title: 'Domain Selection', description: 'We help you choose and secure the perfect domain name for your business.' },
      { title: 'Professional Email', description: 'Google Workspace or Office 365 setup — your name@yourbusiness.com' },
      { title: 'Logo Design', description: 'A custom logo that reflects your brand identity and sets you apart.' },
      { title: 'Website Launch', description: 'A professional website ready to represent your business online.' },
    ],
    order: 1,
    isActive: true,
  },
  {
    _id: 'demo-service-2',
    _type: 'service',
    name: 'Drone Services',
    slug: 'drone-services',
    icon: 'Camera',
    tagline: 'Aerial Photography & Video',
    description: 'Stunning aerial content that makes your property or project stand out. Indoor and outdoor aerial photography and video for real estate listings, commercial property marketing, construction progress documentation, roof inspections, and site surveys.',
    highlights: [
      { title: 'Indoor Aerial', description: 'Interior photography and video for real estate listings and commercial property marketing. Showcase every room from unique angles.' },
      { title: 'Outdoor Aerial', description: 'Exterior shots for property promotion, construction progress documentation, roof inspections, and site surveys.' },
    ],
    order: 2,
    isActive: true,
  },
  {
    _id: 'demo-service-3',
    _type: 'service',
    name: 'IT Services',
    slug: 'it-services',
    icon: 'Headphones',
    tagline: 'Impactful IT Solutions',
    description: 'Small business IT challenges require smart solutions. We provide expert IT support on-demand without the need for a full-time admin, plus reliable day-to-day IT support for your business.',
    highlights: [
      { title: 'Fractional IT Admin', description: 'Expert IT support on-demand. No need for a full-time admin — get professional help when you need it.' },
      { title: 'Ongoing Support', description: 'From crashed laptops to software issues — reliable day-to-day IT support for your business.' },
    ],
    order: 3,
    isActive: true,
  },
];

// ============================================================
// PRICING PLANS — Real daflash pricing from current site
// ============================================================
export const demoPricingPlans: PricingPlan[] = [
  {
    _id: 'demo-pricing-1',
    _type: 'pricingPlan',
    name: 'Website',
    price: 250,
    billingFrequency: 'one-time',
    features: [
      'Professional design & development',
      'Mobile responsive',
      'Contact form',
      'SEO basics',
      'Ready to launch',
    ],
    ctaText: 'Get Started',
    ctaLink: '/contact',
    order: 1,
  },
  {
    _id: 'demo-pricing-2',
    _type: 'pricingPlan',
    name: 'Professional Email Setup',
    price: 200,
    billingFrequency: 'one-time',
    features: [
      'Google Workspace or Office 365',
      'Custom domain email (name@yourbusiness.com)',
      'DNS configuration',
      'Migration support',
      'Setup & training',
    ],
    ctaText: 'Get Started',
    ctaLink: '/contact',
    order: 2,
  },
  {
    _id: 'demo-pricing-3',
    _type: 'pricingPlan',
    name: 'Drone Services',
    price: 200,
    billingFrequency: 'one-time',
    features: [
      'Aerial photography & video',
      '20 minutes flight time included',
      'Professional editing',
      'Digital delivery',
      'Indoor or outdoor',
    ],
    ctaText: 'Book a Flight',
    ctaLink: '/contact',
    order: 3,
  },
];

// ============================================================
// PORTFOLIO — Real daflash clients from current site
// ============================================================
export const demoPortfolioSites: PortfolioSite[] = [
  {
    _id: 'demo-portfolio-1',
    _type: 'portfolioSite',
    clientName: 'WDI Global',
    websiteUrl: 'https://wdiglobal.com',
    order: 1,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-2',
    _type: 'portfolioSite',
    clientName: 'NG Smart ENG',
    websiteUrl: 'https://ngse.co.il',
    order: 2,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-3',
    _type: 'portfolioSite',
    clientName: 'Clinical Stadi',
    websiteUrl: 'https://clinicalstadi.com',
    order: 3,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-4',
    _type: 'portfolioSite',
    clientName: 'WDI America',
    websiteUrl: 'https://wdiamerica.com',
    order: 4,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-5',
    _type: 'portfolioSite',
    clientName: 'WDI Israel',
    websiteUrl: 'https://wdi.co.il',
    order: 5,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-6',
    _type: 'portfolioSite',
    clientName: 'AMG Project Management',
    websiteUrl: 'https://amgpm.com',
    order: 6,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-7',
    _type: 'portfolioSite',
    clientName: 'NNERV',
    websiteUrl: 'https://nnerv.com',
    order: 7,
    isActive: true,
  },
  {
    _id: 'demo-portfolio-8',
    _type: 'portfolioSite',
    clientName: 'Igal Davidi Coaching',
    websiteUrl: 'https://igaldavidi.com',
    order: 8,
    isActive: true,
  },
];

// ============================================================
// TESTIMONIALS — Real testimonials from current site
// ============================================================
export const demoTestimonials: Testimonial[] = [
  {
    _id: 'demo-testimonial-1',
    _type: 'testimonial',
    clientName: 'Ilan Wise',
    quote: 'When we needed a professional website for WDI Global, daflash delivered beyond expectations. In less than 24 hours, they created a sleek, functional site that perfectly reflects our brand. Fast, professional, highly recommended.',
    companyName: 'WDI Global',
    companyUrl: 'https://wdiglobal.com',
    isFeatured: true,
    order: 1,
    isActive: true,
  },
  {
    _id: 'demo-testimonial-2',
    _type: 'testimonial',
    clientName: 'Aron Miller',
    quote: 'I wanted to move away from my old website platform but keep the same professional look. daflash rebuilt everything from scratch and the result is even better than the original. Quick turnaround, great communication, exactly what I needed.',
    companyName: 'AMG Project Management',
    companyUrl: 'https://amgpm.com',
    isFeatured: true,
    order: 2,
    isActive: true,
  },
  {
    _id: 'demo-testimonial-3',
    _type: 'testimonial',
    clientName: 'Itamar D.',
    quote: 'As a startup, every dollar and every day counts. We got quotes from other agencies that were shocking — both in price and timeline. daflash delivered a professional website at a fraction of the cost, in a fraction of the time. Exactly what an early-stage company needs.',
    companyName: 'NNERV',
    companyUrl: 'https://nnerv.com',
    isFeatured: true,
    order: 3,
    isActive: true,
  },
  {
    _id: 'demo-testimonial-4',
    _type: 'testimonial',
    clientName: 'Igal D.',
    quote: 'What impressed me most was the patience with all the technical details — domain setup, DNS configuration, email connections. Things I don\'t understand, handled with care and clear guidance. The final result is a website I\'m proud to share with clients.',
    companyName: 'Igal Davidi Coaching',
    companyUrl: 'https://igaldavidi.com',
    isFeatured: true,
    order: 4,
    isActive: true,
  },
];

// ============================================================
// LANDING PAGES — Real features from current realtor section
// ============================================================
export const demoRealtorsPage: LandingPage = {
  _id: 'demo-landing-realtors',
  _type: 'landingPage',
  pageId: 'realtors',
  heroHeadline: 'Websites for Real Estate Agents',
  heroSubtitle: 'A complete digital presence platform built specifically for realtors. Your brand, your website, fully managed by you.',
  features: [
    {
      icon: 'User',
      title: 'Professional Bio',
      description: 'Tell your story. Showcase your experience with professional photos, statistics (years, transactions, ratings), and social media links.',
    },
    {
      icon: 'Home',
      title: 'Property Listings',
      description: 'Unlimited photo galleries with lightbox, video tours, floor plans, and downloadable documents. Full specs including beds, baths, sqft, and MLS data.',
    },
    {
      icon: 'MapPin',
      title: 'Neighborhoods',
      description: 'Position yourself as the local expert. Rich content about communities, school ratings, price ranges, commute times, and points of interest.',
    },
    {
      icon: 'Users',
      title: 'Lead Capture',
      description: 'Turn visitors into clients. Contact forms, home valuation requests, property inquiries, and buyer search preferences — with email notifications.',
    },
    {
      icon: 'List',
      title: 'Deal Pipeline',
      description: 'Track every transaction from contract to closing. 8-stage visual pipeline with key dates, documents, and client information in one place.',
    },
    {
      icon: 'LayoutDashboard',
      title: 'Powerful Back Office',
      description: 'Manage everything from your phone. Upload photos directly from showings, update listings instantly, track deals — no technical knowledge needed.',
    },
    {
      icon: 'Smartphone',
      title: 'Mobile App (PWA)',
      description: 'Install the admin panel as an app on your phone. Full-screen experience, quick access from home screen, works like a native app.',
    },
    {
      icon: 'ShieldCheck',
      title: 'Compliance Built-in',
      description: 'Stay compliant without thinking about it. TREC disclosures, Fair Housing, IABS document upload, Equal Housing logo — all built in.',
    },
  ],
  whiteLabelText: 'No mention of us anywhere. When clients visit your website, they see only you — a professional, polished presence that\'s entirely yours.',
  ctaText: 'Contact for Quote',
  ctaLink: '/contact',
};

export const demoContractorsPage: LandingPage = {
  _id: 'demo-landing-contractors',
  _type: 'landingPage',
  pageId: 'contractors',
  heroHeadline: 'Websites for Contractors',
  heroSubtitle: 'A complete digital presence platform built specifically for contractors. Your brand, your website, fully managed by you.',
  features: [
    {
      icon: 'User',
      title: 'Professional Bio',
      description: 'Present your expertise, certifications, and years of experience. A professional online presence that wins client trust.',
    },
    {
      icon: 'FolderOpen',
      title: 'Project Portfolio',
      description: 'Showcase completed work with before/after photos, project scope, timeline, and cost range. Let your work speak for itself.',
    },
    {
      icon: 'Wrench',
      title: 'Services Offered',
      description: 'List all services you provide with descriptions, pricing ranges, and service areas. Help clients find exactly what they need.',
    },
    {
      icon: 'Users',
      title: 'Lead Capture',
      description: 'Contact forms, quote requests, and project inquiry forms — with email notifications so you never miss a lead.',
    },
    {
      icon: 'List',
      title: 'Job Pipeline',
      description: 'Track every job from estimate to handoff. 7-stage visual pipeline with key dates, documents, and client information.',
    },
    {
      icon: 'LayoutDashboard',
      title: 'Back Office',
      description: 'Manage everything from your phone. Upload project photos from the job site, update services, track jobs — no tech skills needed.',
    },
    {
      icon: 'Smartphone',
      title: 'Mobile App (PWA)',
      description: 'Install the admin panel as an app on your phone. Manage your business from the job site, anywhere, anytime.',
    },
    {
      icon: 'ShieldCheck',
      title: 'License & Insurance',
      description: 'Automatic display of your licensing and insurance credentials. Build trust with potential clients from the first visit.',
    },
  ],
  whiteLabelText: 'No mention of us anywhere. When clients visit your website, they see only you — a professional, polished presence that\'s entirely yours.',
  ctaText: 'Contact for Quote',
  ctaLink: '/contact',
};

// ============================================================
// SITE SETTINGS — Real daflash branding
// ============================================================
export const demoSiteSettings: SiteSettings = {
  _id: 'demo-site-settings',
  _type: 'siteSettings',
  heroHeadline: 'Domain. Email. Website. In 24 Hours.',
  heroSubtitle: 'Your business deserves more than a Gmail address. We build your complete professional online presence — lightning fast.',
  heroCtaText: 'Get Started',
  heroCtaLink: '/contact',
  aboutHeadline: 'About daflash',
  aboutText: 'daflash is a digital services company that provides small businesses with everything they need to establish a professional online presence: domain registration, professional email, website development, drone photography, and IT support.',
  aboutStats: [
    { value: '24h', label: 'Average Delivery' },
    { value: '8+', label: 'Happy Clients' },
    { value: '100%', label: 'White Label' },
  ],
  contactEmail: 'contact@daflash.com',
  companyName: 'daflash',
  companySpecialty: 'Digital Services & Web Development',
  defaultContractTerms: `TERMS AND CONDITIONS

1. PAYMENT TERMS
Payment is due according to the schedule outlined in this agreement. Late payments may incur additional fees.

2. DELIVERY
Estimated delivery timelines are provided in good faith. daflash will make every effort to meet stated deadlines.

3. OWNERSHIP
Upon full payment, the client receives full ownership of all deliverables including website code, domain, and email accounts.

4. CANCELLATION
Either party may cancel this agreement with 30 days written notice. Work completed up to the cancellation date will be billed accordingly.

5. WARRANTY
daflash provides 30 days of bug fixes and minor adjustments after project delivery at no additional cost.`,
};

// ============================================================
// CLIENTS — Empty by default (populated via admin)
// ============================================================
export const demoClients: Client[] = [];

// ============================================================
// CATALOG — Empty by default (populated via admin)
// ============================================================
export const demoCatalogItems: CatalogItem[] = [];

// ============================================================
// QUOTES & INVOICES — Empty by default
// ============================================================
export const demoQuotes: Quote[] = [];
export const demoInvoices: Invoice[] = [];
