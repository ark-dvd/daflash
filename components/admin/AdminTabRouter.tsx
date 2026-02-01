// components/admin/AdminTabRouter.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Home, HardHat, ArrowRight } from 'lucide-react';
import ServicesTab from './tabs/ServicesTab';
import PricingTab from './tabs/PricingTab';
import PortfolioTab from './tabs/PortfolioTab';
import TestimonialsTab from './tabs/TestimonialsTab';
import LandingPageEditor from './tabs/LandingPageEditor';
import SiteSettingsTab from './tabs/SiteSettingsTab';
import QuotesInvoicesTab from './tabs/QuotesInvoicesTab';

// Loading fallback
function TabLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Placeholder for future tabs
function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <h2 className="text-xl font-semibold font-heading text-gray-900 mb-2">{name}</h2>
      <p className="text-gray-500 text-sm">Coming in the next phase.</p>
    </div>
  );
}

// Landing page selector - shows cards to choose between Realtors and Contractors
function LandingPageSelector() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Landing Pages</h1>
        <p className="text-sm text-gray-500 mt-1">Edit content for industry-specific landing pages</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin?tab=realtors"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold font-heading text-gray-900 mb-1">Realtors</h3>
          <p className="text-sm text-gray-500 mb-4">
            Customize the landing page for real estate agents
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            Edit Page <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
        <Link
          href="/admin?tab=contractors"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all group"
        >
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <HardHat className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold font-heading text-gray-900 mb-1">Contractors</h3>
          <p className="text-sm text-gray-500 mb-4">
            Customize the landing page for contractors
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            Edit Page <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function TabContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  switch (tab) {
    case 'services':
      return <ServicesTab />;
    case 'pricing':
      return <PricingTab />;
    case 'portfolio':
      return <PortfolioTab />;
    case 'testimonials':
      return <TestimonialsTab />;
    case 'landing-pages':
      return <LandingPageSelector />;
    case 'realtors':
      return <LandingPageEditor pageId="realtors" />;
    case 'contractors':
      return <LandingPageEditor pageId="contractors" />;
    case 'quotes-invoices':
      return <QuotesInvoicesTab />;
    case 'settings':
      return <SiteSettingsTab />;
    default:
      return null; // Dashboard (no tab param) — handled by page.tsx
  }
}

export default function AdminTabRouter() {
  return (
    <Suspense fallback={<TabLoading />}>
      <TabContent />
    </Suspense>
  );
}
