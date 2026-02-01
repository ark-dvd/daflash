// components/admin/tabs/PricingTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, DollarSign } from 'lucide-react';
import type { PricingPlan } from '@/schemas';
import SlidePanel from '../shared/SlidePanel';
import ConfirmDialog from '../shared/ConfirmDialog';

const emptyForm = {
  name: '',
  price: 0,
  originalPrice: undefined as number | undefined,
  billingFrequency: 'one-time' as 'one-time' | 'monthly' | 'annual',
  features: [] as string[],
  badge: '',
  ctaText: 'Get Started',
  ctaLink: '/contact',
  order: 0,
};

export default function PricingTab() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PricingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pricing');
      if (res.ok) setPlans(await res.json());
    } catch {
      // skip
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setForm({ ...emptyForm, order: plans.length + 1 });
    setIsPanelOpen(true);
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price,
      originalPrice: plan.originalPrice,
      billingFrequency: plan.billingFrequency || 'one-time',
      features: plan.features || [],
      badge: plan.badge || '',
      ctaText: plan.ctaText || 'Get Started',
      ctaLink: plan.ctaLink || '/contact',
      order: plan.order || 0,
    });
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setIsSaving(true);
    try {
      const url = editingPlan ? `/api/admin/pricing/${editingPlan._id}` : '/api/admin/pricing';
      const method = editingPlan ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(editingPlan ? 'Plan updated' : 'Plan created');
        setIsPanelOpen(false);
        fetchPlans();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save');
      }
    } catch {
      showToast('Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/pricing/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Plan deleted');
        setDeleteTarget(null);
        fetchPlans();
      }
    } catch {
      showToast('Failed to delete plan');
    } finally {
      setIsDeleting(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const formatFrequency = (f: string) => {
    if (f === 'one-time') return 'One-time';
    if (f === 'monthly') return '/mo';
    return '/yr';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Pricing</h1>
          <p className="text-sm text-gray-500 mt-1">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && plans.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 font-heading mb-1">No pricing plans</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first pricing plan.</p>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>
      )}

      {/* Plans Grid */}
      {!isLoading && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group relative">
              {plan.badge && (
                <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-base font-semibold font-heading text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-3">
                {plan.originalPrice && (
                  <span className="text-sm text-gray-400 line-through mr-2">${plan.originalPrice}</span>
                )}
                <span className="text-3xl font-bold font-heading text-primary">${plan.price}</span>
                <span className="text-sm text-gray-400 ml-1">{formatFrequency(plan.billingFrequency)}</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {(plan.features || []).slice(0, 4).map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span> {f}
                  </li>
                ))}
                {(plan.features || []).length > 4 && (
                  <li className="text-xs text-gray-400">+{plan.features.length - 4} more</li>
                )}
              </ul>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(plan)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteTarget(plan)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingPlan ? 'Edit Plan' : 'Add Plan'}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Plan Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Professional" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Price ($) <span className="text-red-500">*</span></label>
              <input type="number" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Original Price</label>
              <input type="number" value={form.originalPrice ?? ''} onChange={(e) => setForm(prev => ({ ...prev, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined }))} placeholder="Strikethrough" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Billing Frequency</label>
            <div className="flex gap-2">
              {(['one-time', 'monthly', 'annual'] as const).map((f) => (
                <button key={f} type="button" onClick={() => setForm(prev => ({ ...prev, billingFrequency: f }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.billingFrequency === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f === 'one-time' ? 'One-time' : f === 'monthly' ? 'Monthly' : 'Annual'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Badge</label>
            <input type="text" value={form.badge} onChange={(e) => setForm(prev => ({ ...prev, badge: e.target.value }))} placeholder="e.g. Most Popular" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Features</label>
            <div className="space-y-2 mb-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700 flex-1">{f}</span>
                  <button type="button" onClick={() => removeFeature(i)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }} placeholder="Add a feature" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <button type="button" onClick={addFeature} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Add</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">CTA Text</label>
              <input type="text" value={form.ctaText} onChange={(e) => setForm(prev => ({ ...prev, ctaText: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">CTA Link</label>
              <input type="text" value={form.ctaLink} onChange={(e) => setForm(prev => ({ ...prev, ctaLink: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Display Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))} className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <button onClick={handleSave} disabled={isSaving || !form.name.trim()} className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {editingPlan ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </SlidePanel>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Plan" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} isLoading={isDeleting} />

      {toast && <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[100]">{toast}</div>}
    </div>
  );
}
