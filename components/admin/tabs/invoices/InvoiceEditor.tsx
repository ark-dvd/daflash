// components/admin/tabs/invoices/InvoiceEditor.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Invoice, Client, LineItem } from '@/schemas';
import { DEFAULT_TAX_SETTINGS, calculateTax, calculateItemTotal, formatCurrency, TaxSettings } from '@/lib/tax-utils';

interface InvoiceEditorProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: () => void;
}

export default function InvoiceEditor({ invoice, onClose, onSave }: InvoiceEditorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(invoice?.client?._id || '');
  const [lineItems, setLineItems] = useState<LineItem[]>(invoice?.lineItems || []);
  const [taxEnabled, setTaxEnabled] = useState(invoice?.taxEnabled ?? DEFAULT_TAX_SETTINGS.taxEnabled);
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? DEFAULT_TAX_SETTINGS.taxRate);
  const [texasExemptionEnabled, setTexasExemptionEnabled] = useState(
    invoice?.texasExemptionEnabled ?? DEFAULT_TAX_SETTINGS.texasExemptionEnabled
  );
  const [issueDate, setIssueDate] = useState(
    invoice?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Load clients
  useEffect(() => {
    fetch('/api/admin/clients')
      .then((res) => res.json())
      .then(setClients)
      .catch(() => {});
  }, []);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const taxSettings: TaxSettings = { taxEnabled, taxRate, texasExemptionEnabled };
    const processedItems = lineItems.map((item) => ({
      ...item,
      total: calculateItemTotal(item),
    }));
    return calculateTax(processedItems, taxSettings);
  }, [lineItems, taxEnabled, taxRate, texasExemptionEnabled]);

  const totals = calculateTotals();

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        _key: crypto.randomUUID(),
        name: '',
        description: '',
        qty: 1,
        unitPrice: 0,
        discount: 0,
        isTaxExempt: false,
        total: 0,
      },
    ]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: unknown) => {
    const newItems = [...lineItems];
    const item = { ...newItems[index], [field]: value };

    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      item.total = calculateItemTotal({
        qty: field === 'qty' ? (value as number) : item.qty,
        unitPrice: field === 'unitPrice' ? (value as number) : item.unitPrice,
        discount: field === 'discount' ? (value as number) : item.discount,
      });
    }

    newItems[index] = item;
    setLineItems(newItems);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedClientId) return;
    if (lineItems.length === 0) return;

    setIsSaving(true);
    try {
      const payload = {
        client: selectedClientId,
        lineItems: lineItems.map((item) => ({
          ...item,
          total: calculateItemTotal(item),
        })),
        subtotal: totals.subtotal,
        taxEnabled,
        taxRate,
        texasExemptionEnabled,
        taxAmount: totals.taxAmount,
        total: totals.grandTotal,
        issueDate,
        dueDate,
        status: invoice?.status || 'Draft',
        notes,
        ...(invoice?.relatedQuote ? { relatedQuote: invoice.relatedQuote._id } : {}),
      };

      const url = invoice ? `/api/admin/invoices/${invoice._id}` : '/api/admin/invoices';
      const method = invoice ? 'PUT' : 'POST';

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

  const selectedClient = clients.find((c) => c._id === selectedClientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-heading text-gray-900">
            {invoice ? `Edit ${invoice.invoiceNumber}` : 'New Invoice'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.clientName}
                  {client.contactPerson && ` (${client.contactPerson})`}
                </option>
              ))}
            </select>
            {selectedClient && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-900">{selectedClient.clientName}</p>
                {selectedClient.email && <p className="text-gray-600">{selectedClient.email}</p>}
                {selectedClient.billingAddress && (
                  <p className="text-gray-600">{selectedClient.billingAddress}</p>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Line Items</h4>
              <span className="text-sm text-gray-500">{lineItems.length} items</span>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item._key || index} className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-12 gap-3">
                    {/* Name */}
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                        placeholder="Service or product"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>

                    {/* Qty */}
                    <div className="col-span-4 sm:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateLineItem(index, 'qty', Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>

                    {/* Price */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              'unitPrice',
                              Math.max(0, parseFloat(e.target.value) || 0)
                            )
                          }
                          className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Discount</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount || 0}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              'discount',
                              Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                            )
                          }
                          className="w-full pr-6 pl-2 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-8 sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Total</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="col-span-4 sm:col-span-1 flex items-end justify-end">
                      <button
                        onClick={() => removeLineItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Second row: Description + Tax Exempt */}
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Optional details"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-5">
                        <input
                          type="checkbox"
                          checked={item.isTaxExempt || false}
                          onChange={(e) => updateLineItem(index, 'isTaxExempt', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          Tax Exempt
                          {item.isTaxExempt && (
                            <span className="ml-1 text-blue-600">(No tax)</span>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addLineItem}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Line Item
              </button>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Tax Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Enable Tax</span>
              </label>

              {taxEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) =>
                        setTaxRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={texasExemptionEnabled}
                        onChange={(e) => setTexasExemptionEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Texas 20% exemption</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions, thank you message, etc."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
            />
          </div>

          {/* Totals Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {taxEnabled && (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>
                      Taxable Amount
                      {texasExemptionEnabled && ' (80%)'}
                    </span>
                    <span>{formatCurrency(totals.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({taxRate}%)</span>
                    <span>{formatCurrency(totals.taxAmount)}</span>
                  </div>
                </>
              )}
              <div className="border-t border-primary/20 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg text-primary">
                  <span>Total</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedClientId || lineItems.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium text-sm transition-colors ${
              !isSaving && selectedClientId && lineItems.length > 0
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {invoice ? 'Update Invoice' : 'Create Invoice'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
