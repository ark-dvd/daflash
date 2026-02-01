// components/admin/tabs/invoices/InvoicesList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Receipt, Send, Check, X, Clock, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Invoice } from '@/schemas';
import { formatCurrency } from '@/lib/tax-utils';
import InvoiceEditor from './InvoiceEditor';
import ConfirmDialog from '../../shared/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  Draft: Receipt,
  Sent: Send,
  Paid: Check,
  Overdue: AlertCircle,
  Cancelled: X,
};

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch {
      showToast('Failed to load invoices', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/invoices/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setInvoices((prev) => prev.filter((i) => i._id !== deleteId));
        showToast('Invoice deleted', 'success');
      } else {
        showToast('Failed to delete invoice', 'error');
      }
    } catch {
      showToast('Failed to delete invoice', 'error');
    }
    setDeleteId(null);
  };

  const handleUpdateStatus = async (invoiceId: string, status: string) => {
    try {
      const invoice = invoices.find((i) => i._id === invoiceId);
      if (!invoice) return;

      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: invoice.client._id,
          lineItems: invoice.lineItems,
          subtotal: invoice.subtotal,
          discountTotal: invoice.discountTotal,
          taxRate: invoice.taxRate,
          applyExemption: invoice.applyExemption,
          taxableAmount: invoice.taxableAmount,
          exemptAmount: invoice.exemptAmount,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status,
          notes: invoice.notes,
        }),
      });

      if (res.ok) {
        await fetchInvoices();
        showToast(`Invoice marked as ${status}`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
    setActionMenuId(null);
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status !== 'Sent') return false;
    return new Date(invoice.dueDate) < new Date();
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
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
            placeholder="Search invoices..."
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
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowEditor(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No invoices found</p>
          <button
            onClick={() => setShowEditor(true)}
            className="mt-4 text-primary font-medium text-sm hover:underline"
          >
            Create your first invoice
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Invoice #
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Issue Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Due Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => {
                  const overdue = isOverdue(invoice);
                  const displayStatus = overdue ? 'Overdue' : invoice.status;
                  const StatusIcon = STATUS_ICONS[displayStatus] || Receipt;
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                          {invoice.relatedQuote && (
                            <p className="text-xs text-gray-500">
                              From {invoice.relatedQuote.quoteNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.client.clientName}</p>
                          {invoice.client.contactPerson && (
                            <p className="text-xs text-gray-500">{invoice.client.contactPerson}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(invoice.total)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[displayStatus]}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm ${
                            overdue ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}
                        >
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setActionMenuId(actionMenuId === invoice._id ? null : invoice._id)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                          {actionMenuId === invoice._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                              <button
                                onClick={() => {
                                  setEditingInvoice(invoice);
                                  setShowEditor(true);
                                  setActionMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Edit Invoice
                              </button>
                              {invoice.status === 'Draft' && (
                                <button
                                  onClick={() => handleUpdateStatus(invoice._id, 'Sent')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Sent
                                </button>
                              )}
                              {(invoice.status === 'Sent' || overdue) && (
                                <button
                                  onClick={() => handleUpdateStatus(invoice._id, 'Paid')}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-50"
                                >
                                  Mark as Paid
                                </button>
                              )}
                              {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && (
                                <button
                                  onClick={() => handleUpdateStatus(invoice._id, 'Cancelled')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                                >
                                  Cancel Invoice
                                </button>
                              )}
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={() => {
                                  setDeleteId(invoice._id);
                                  setActionMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                Delete Invoice
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

      {/* Invoice Editor */}
      {showEditor && (
        <InvoiceEditor
          invoice={editingInvoice}
          onClose={() => {
            setShowEditor(false);
            setEditingInvoice(null);
          }}
          onSave={() => {
            setShowEditor(false);
            setEditingInvoice(null);
            fetchInvoices();
            showToast(editingInvoice ? 'Invoice updated' : 'Invoice created', 'success');
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
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
