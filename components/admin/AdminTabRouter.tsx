// components/admin/AdminTabRouter.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ServicesTab from './tabs/ServicesTab';
import PricingTab from './tabs/PricingTab';
import PortfolioTab from './tabs/PortfolioTab';
import TestimonialsTab from './tabs/TestimonialsTab';

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
      return <PlaceholderTab name="Landing Pages" />;
    case 'clients':
      return <PlaceholderTab name="Clients" />;
    case 'catalog':
      return <PlaceholderTab name="Catalog" />;
    case 'quotes':
      return <PlaceholderTab name="Quotes" />;
    case 'invoices':
      return <PlaceholderTab name="Invoices" />;
    case 'settings':
      return <PlaceholderTab name="Site Settings" />;
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
