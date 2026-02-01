// components/admin/tabs/quotes/CatalogManager.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Package, DollarSign } from 'lucide-react';
import { CatalogItem } from '@/schemas';
import { formatCurrency } from '@/lib/tax-utils';
import SlidePanel from '../../shared/SlidePanel';
import ConfirmDialog from '../../shared/ConfirmDialog';

const CATEGORY_OPTIONS = [
  { value: '', label: 'No Category' },
  { value: 'web-design', label: 'Web Design' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'seo', label: 'SEO' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const BILLING_LABELS: Record<string, string> = {
  'one-time': 'One-Time',
  monthly: 'Monthly',
  annual: 'Annual',
};

type BillingType = 'one-time' | 'monthly' | 'annual';

interface CatalogForm {
  name: string;
  description: string;
  unitPrice: number;
  billingType: BillingType;
  category: string;
}

const emptyForm: CatalogForm = {
  name: '',
  description: '',
  unitPrice: 0,
  billingType: 'one-time',
  category: '',
};

export default function CatalogManager() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [billingFilter, setBillingFilter] = useState<string>('all');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/catalog');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      showToast('Failed to load catalog', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openPanel = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description || '',
        unitPrice: item.unitPrice,
        billingType: item.billingType,
        category: item.category || '',
      });
    } else {
      setEditingItem(null);
      setForm(emptyForm);
    }
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/catalog/${editingItem._id}`
        : '/api/admin/catalog';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchItems();
        setIsPanelOpen(false);
        showToast(editingItem ? 'Item updated' : 'Item created', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save item', 'error');
      }
    } catch {
      showToast('Failed to save item', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/catalog/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== deleteId));
        showToast('Item deleted', 'success');
      } else {
        showToast('Failed to delete item', 'error');
      }
    } catch {
      showToast('Failed to delete item', 'error');
    }
    setDeleteId(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBilling = billingFilter === 'all' || item.billingType === billingFilter;
    return matchesSearch && matchesBilling;
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
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
          />
        </div>
        <select
          value={billingFilter}
          onChange={(e) => setBillingFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white"
        >
          <option value="all">All Types</option>
          <option value="one-time">One-Time</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
        <button
          onClick={() => openPanel()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No catalog items found</p>
          <button
            onClick={() => openPanel()}
            className="mt-4 text-primary font-medium text-sm hover:underline"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.category && (
                      <span className="text-xs text-gray-500 capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openPanel(item)}
                    className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-900 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(item.unitPrice).replace('$', '')}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.billingType === 'one-time'
                      ? 'bg-gray-100 text-gray-600'
                      : item.billingType === 'monthly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {BILLING_LABELS[item.billingType]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      <SlidePanel
        isOpen={isPanelOpen}
        title={editingItem ? 'Edit Catalog Item' : 'Add Catalog Item'}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Website Design Package"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what's included..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm({ ...form, unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Billing Type</label>
              <select
                value={form.billingType}
                onChange={(e) =>
                  setForm({ ...form, billingType: e.target.value as 'one-time' | 'monthly' | 'annual' })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white"
              >
                <option value="one-time">One-Time</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Categories like Web Design, Development, Hosting, etc. qualify for tax exemption.
            </p>
          </div>
        </div>
      </SlidePanel>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Catalog Item"
        message="Are you sure you want to delete this item? It will be removed from the catalog but not from existing quotes."
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
