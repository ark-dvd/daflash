// components/admin/tabs/quotes/QuoteWizard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Users, Package, Calculator, FileText, Eye } from 'lucide-react';
import { Quote, Client, CatalogItem, LineItem } from '@/schemas';
import { DEFAULT_TAX_SETTINGS, calculateTax, calculateItemTotal, formatCurrency, TaxSettings } from '@/lib/tax-utils';
import LineItemEditor from './LineItemEditor';
import TaxSettingsPanel from './TaxSettings';

interface QuoteWizardProps {
  quote: Quote | null;
  onClose: () => void;
  onSave: () => void;
}

type Step = 'client' | 'items' | 'tax' | 'terms' | 'review';

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'client', label: 'Client', icon: Users },
  { id: 'items', label: 'Line Items', icon: Package },
  { id: 'tax', label: 'Tax', icon: Calculator },
  { id: 'terms', label: 'Terms', icon: FileText },
  { id: 'review', label: 'Review', icon: Eye },
];

const emptyLineItem = (): LineItem => ({
  _key: crypto.randomUUID(),
  name: '',
  description: '',
  qty: 1,
  unitPrice: 0,
  discount: 0,
  isTaxExempt: false,
  total: 0,
});

export default function QuoteWizard({ quote, onClose, onSave }: QuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('client');
  const [isSaving, setIsSaving] = useState(false);

  // Client step
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(quote?.client?._id || '');
  const [clientSearch, setClientSearch] = useState('');

  // Items step
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [oneTimeItems, setOneTimeItems] = useState<LineItem[]>(quote?.oneTimeItems || []);
  const [recurringItems, setRecurringItems] = useState<LineItem[]>(quote?.recurringItems || []);

  // Tax step
  const [taxEnabled, setTaxEnabled] = useState(quote?.taxEnabled ?? DEFAULT_TAX_SETTINGS.taxEnabled);
  const [taxRate, setTaxRate] = useState(quote?.taxRate ?? DEFAULT_TAX_SETTINGS.taxRate);
  const [texasExemptionEnabled, setTexasExemptionEnabled] = useState(
    quote?.texasExemptionEnabled ?? DEFAULT_TAX_SETTINGS.texasExemptionEnabled
  );

  // Terms step
  const [contractTerms, setContractTerms] = useState(quote?.contractTerms || '');
  const [expiryDate, setExpiryDate] = useState(
    quote?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Load clients and catalog
  useEffect(() => {
    const fetchData = async () => {
      const [clientsRes, catalogRes] = await Promise.all([
        fetch('/api/admin/clients'),
        fetch('/api/admin/catalog'),
      ]);
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (catalogRes.ok) setCatalog(await catalogRes.json());
    };
    fetchData();
  }, []);

  // Load default contract terms from settings
  useEffect(() => {
    if (!quote && !contractTerms) {
      fetch('/api/admin/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data?.defaultContractTerms) {
            setContractTerms(data.defaultContractTerms);
          }
        })
        .catch(() => {});
    }
  }, [quote, contractTerms]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const taxSettings: TaxSettings = { taxEnabled, taxRate, texasExemptionEnabled };

    // Process items with correct totals
    const processedOneTime = oneTimeItems.map((item) => ({
      ...item,
      total: calculateItemTotal(item),
    }));
    const processedRecurring = recurringItems.map((item) => ({
      ...item,
      total: calculateItemTotal(item),
    }));

    const oneTimeCalc = calculateTax(processedOneTime, taxSettings);
    const recurringCalc = calculateTax(processedRecurring, taxSettings);

    return {
      oneTimeSubtotal: oneTimeCalc.subtotal,
      oneTimeTaxAmount: oneTimeCalc.taxAmount,
      oneTimeGrandTotal: oneTimeCalc.grandTotal,
      monthlySubtotal: recurringCalc.subtotal,
      monthlyTaxAmount: recurringCalc.taxAmount,
      monthlyGrandTotal: recurringCalc.grandTotal,
      totalTaxAmount: oneTimeCalc.taxAmount + recurringCalc.taxAmount,
      grandTotal: oneTimeCalc.grandTotal,
    };
  }, [oneTimeItems, recurringItems, taxEnabled, taxRate, texasExemptionEnabled]);

  const totals = calculateTotals();

  const handleSave = async () => {
    if (!selectedClientId) return;

    setIsSaving(true);
    try {
      const payload = {
        client: selectedClientId,
        oneTimeItems: oneTimeItems.map((item) => ({
          ...item,
          total: calculateItemTotal(item),
        })),
        recurringItems: recurringItems.map((item) => ({
          ...item,
          total: calculateItemTotal(item),
        })),
        oneTimeSubtotal: totals.oneTimeSubtotal,
        monthlySubtotal: totals.monthlySubtotal,
        taxEnabled,
        taxRate,
        texasExemptionEnabled,
        taxAmount: totals.totalTaxAmount,
        grandTotal: totals.grandTotal,
        contractTerms,
        expiryDate,
        status: quote?.status || 'Draft',
      };

      const url = quote ? `/api/admin/quotes/${quote._id}` : '/api/admin/quotes';
      const method = quote ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'client':
        return !!selectedClientId;
      case 'items':
        return oneTimeItems.length > 0 || recurringItems.length > 0;
      case 'tax':
        return true;
      case 'terms':
        return !!expiryDate;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goToStep = (step: Step) => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    const targetIndex = STEPS.findIndex((s) => s.id === step);
    if (targetIndex <= currentIndex || canProceed()) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = clients.find((c) => c._id === selectedClientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-heading text-gray-900">
            {quote ? `Edit ${quote.quoteNumber}` : 'New Quote'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50 overflow-x-auto">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = STEPS.findIndex((s) => s.id === currentStep) > index;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white'
                    : isPast
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                {isPast ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Client */}
          {currentStep === 'client' && (
            <div>
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-4">Select Client</h3>
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none mb-4"
              />
              <div className="grid gap-2 max-h-80 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client._id}
                    onClick={() => setSelectedClientId(client._id)}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${
                      selectedClientId === client._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{client.clientName}</p>
                    {client.contactPerson && (
                      <p className="text-sm text-gray-500">{client.contactPerson}</p>
                    )}
                    {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    No clients found. Add clients in the Clients tab.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Line Items */}
          {currentStep === 'items' && (
            <div className="space-y-6">
              <LineItemEditor
                title="One-Time Items"
                items={oneTimeItems}
                catalog={catalog.filter((c) => c.billingType === 'one-time')}
                onChange={setOneTimeItems}
              />
              <LineItemEditor
                title="Recurring Items (Monthly)"
                items={recurringItems}
                catalog={catalog.filter((c) => c.billingType === 'monthly')}
                onChange={setRecurringItems}
              />
            </div>
          )}

          {/* Step 3: Tax */}
          {currentStep === 'tax' && (
            <TaxSettingsPanel
              taxEnabled={taxEnabled}
              taxRate={taxRate}
              texasExemptionEnabled={texasExemptionEnabled}
              onTaxEnabledChange={setTaxEnabled}
              onTaxRateChange={setTaxRate}
              onTexasExemptionEnabledChange={setTexasExemptionEnabled}
              oneTimeItems={oneTimeItems}
              recurringItems={recurringItems}
            />
          )}

          {/* Step 4: Terms */}
          {currentStep === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-4">Contract Terms</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Terms & Conditions
                </label>
                <textarea
                  rows={10}
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  placeholder="Enter contract terms and conditions..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold font-heading text-gray-900">Review Quote</h3>

              {/* Client */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Client</p>
                <p className="font-medium text-gray-900">{selectedClient?.clientName}</p>
                {selectedClient?.email && (
                  <p className="text-sm text-gray-600">{selectedClient.email}</p>
                )}
              </div>

              {/* Items Summary */}
              <div className="space-y-4">
                {oneTimeItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">One-Time Items</p>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {oneTimeItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>
                            {item.name} x{item.qty}
                            {(item.discount || 0) > 0 && (
                              <span className="text-green-600 ml-2">(-{item.discount}%)</span>
                            )}
                            {item.isTaxExempt && (
                              <span className="text-blue-600 ml-2">(Tax Exempt)</span>
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(calculateItemTotal(item))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {recurringItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Monthly Items</p>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {recurringItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>
                            {item.name} x{item.qty}
                            {(item.discount || 0) > 0 && (
                              <span className="text-green-600 ml-2">(-{item.discount}%)</span>
                            )}
                            {item.isTaxExempt && (
                              <span className="text-blue-600 ml-2">(Tax Exempt)</span>
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(calculateItemTotal(item))}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="space-y-2">
                  {totals.oneTimeSubtotal > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>One-Time Subtotal</span>
                        <span>{formatCurrency(totals.oneTimeSubtotal)}</span>
                      </div>
                      {taxEnabled && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            Tax ({taxRate}%)
                            {texasExemptionEnabled && ' (20% exemption applied)'}
                          </span>
                          <span>{formatCurrency(totals.oneTimeTaxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-primary">
                        <span>One-Time Total</span>
                        <span>{formatCurrency(totals.oneTimeGrandTotal)}</span>
                      </div>
                    </>
                  )}
                  {totals.monthlySubtotal > 0 && (
                    <>
                      <div className="border-t border-primary/20 my-2" />
                      <div className="flex justify-between text-sm">
                        <span>Monthly Subtotal</span>
                        <span>{formatCurrency(totals.monthlySubtotal)}</span>
                      </div>
                      {taxEnabled && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            Monthly Tax ({taxRate}%)
                            {texasExemptionEnabled && ' (20% exemption applied)'}
                          </span>
                          <span>{formatCurrency(totals.monthlyTaxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-primary">
                        <span>Monthly Total</span>
                        <span>{formatCurrency(totals.monthlyGrandTotal)}/mo</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Expiry */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Quote Valid Until</span>
                <span>{new Date(expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 'client'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              currentStep === 'client'
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {quote ? 'Update Quote' : 'Create Quote'}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                canProceed()
                  ? 'bg-primary hover:bg-primary-dark text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
