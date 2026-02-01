// components/admin/tabs/QuotesInvoicesTab.tsx
'use client';

import { useState } from 'react';
import { FileText, Receipt, Users, Package } from 'lucide-react';
import QuotesList from './quotes/QuotesList';
import InvoicesList from './invoices/InvoicesList';
import ClientsManager from './quotes/ClientsManager';
import CatalogManager from './quotes/CatalogManager';

type SubTab = 'quotes' | 'invoices' | 'clients' | 'catalog';

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: 'quotes', label: 'Quotes', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'catalog', label: 'Catalog', icon: Package },
];

export default function QuotesInvoicesTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('quotes');

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Quotes & Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create quotes, convert to invoices, manage clients and catalog
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeSubTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === 'quotes' && <QuotesList />}
      {activeSubTab === 'invoices' && <InvoicesList />}
      {activeSubTab === 'clients' && <ClientsManager />}
      {activeSubTab === 'catalog' && <CatalogManager />}
    </div>
  );
}
