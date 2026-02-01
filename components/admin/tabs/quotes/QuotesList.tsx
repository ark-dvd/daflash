// components/admin/tabs/quotes/QuotesList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Send, Check, X, Clock, MoreHorizontal, Receipt } from 'lucide-react';
import { Quote } from '@/schemas';
import { formatCurrency } from '@/lib/tax-utils';
import QuoteWizard from './QuoteWizard';
import ConfirmDialog from '../../shared/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Declined: 'bg-red-100 text-red-700',
  Expired: 'bg-yellow-100 text-yellow-700',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  Draft: FileText,
  Sent: Send,
  Accepted: Check,
  Declined: X,
  Expired: Clock,
};

export default function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch {
      showToast('Failed to load quotes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/quotes/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setQuotes((prev) => prev.filter((q) => q._id !== deleteId));
        showToast('Quote deleted', 'success');
      } else {
        showToast('Failed to delete quote', 'error');
      }
    } catch {
      showToast('Failed to delete quote', 'error');
    }
    setDeleteId(null);
  };

  const handleCreateInvoice = async (quote: Quote) => {
    // Navigate to invoices tab with quote data
    // For now, show a message
    showToast(`Creating invoice from ${quote.quoteNumber}...`, 'success');
    setActionMenuId(null);
    // This would typically navigate to the invoice creation flow
  };

  const handleUpdateStatus = async (quoteId: string, status: string) => {
    try {
      const quote = quotes.find((q) => q._id === quoteId);
      if (!quote) return;

      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: quote.client._id,
          oneTimeItems: quote.oneTimeItems,
          recurringItems: quote.recurringItems,
          oneTimeSubtotal: quote.oneTimeSubtotal,
          monthlySubtotal: quote.monthlySubtotal,
          taxRate: quote.taxRate,
          applyExemption: quote.applyExemption,
          oneTimeTax: quote.oneTimeTax,
          monthlyTax: quote.monthlyTax,
          oneTimeTotal: quote.oneTimeTotal,
          monthlyTotal: quote.monthlyTotal,
          contractTerms: quote.contractTerms,
          expiryDate: quote.expiryDate,
          status,
        }),
      });

      if (res.ok) {
        await fetchQuotes();
        showToast(`Quote marked as ${status}`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
    setActionMenuId(null);
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.client.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">Accepted</option>
          <option value="Declined">Declined</option>
          <option value="Expired">Expired</option>
        </select>
        <button
          onClick={() => {
            setEditingQuote(null);
            setShowWizard(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No quotes found</p>
          <button
            onClick={() => setShowWizard(true)}
            className="mt-4 text-primary font-medium text-sm hover:underline"
          >
            Create your first quote
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Quote #
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    One-Time
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Monthly
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Expires
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => {
                  const StatusIcon = STATUS_ICONS[quote.status] || FileText;
                  return (
                    <tr key={quote._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{quote.quoteNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{quote.client.clientName}</p>
                          {quote.client.contactPerson && (
                            <p className="text-xs text-gray-500">{quote.client.contactPerson}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(quote.oneTimeTotal || quote.oneTimeSubtotal)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {quote.monthlyTotal || quote.monthlySubtotal > 0 ? (
                          <span className="font-medium text-gray-900">
                            {formatCurrency(quote.monthlyTotal || quote.monthlySubtotal)}/mo
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[quote.status]}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(quote.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === quote._id ? null : quote._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                          {actionMenuId === quote._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                              <button
                                onClick={() => {
                                  setEditingQuote(quote);
                                  setShowWizard(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Edit Quote
                              </button>
                              {quote.status === 'Draft' && (
                                <button
                                  onClick={() => handleUpdateStatus(quote._id, 'Sent')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Sent
                                </button>
                              )}
                              {quote.status === 'Sent' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(quote._id, 'Accepted')}
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-50"
                                  >
                                    Mark as Accepted
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(quote._id, 'Declined')}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-50"
                                  >
                                    Mark as Declined
                                  </button>
                                </>
                              )}
                              {quote.status === 'Accepted' && (
                                <button
                                  onClick={() => handleCreateInvoice(quote)}
                                  className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Receipt className="w-4 h-4" />
                                  Create Invoice
                                </button>
                              )}
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={() => {
                                  setDeleteId(quote._id);
                                  setActionMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                Delete Quote
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Wizard */}
      {showWizard && (
        <QuoteWizard
          quote={editingQuote}
          onClose={() => {
            setShowWizard(false);
            setEditingQuote(null);
          }}
          onSave={() => {
            setShowWizard(false);
            setEditingQuote(null);
            fetchQuotes();
            showToast(editingQuote ? 'Quote updated' : 'Quote created', 'success');
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Quote"
        message="Are you sure you want to delete this quote? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-24 lg:bottom-8 right-4 sm:right-8 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[100] ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
