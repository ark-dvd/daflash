// components/admin/tabs/TestimonialsTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import type { Testimonial } from '@/schemas';
import SlidePanel from '../shared/SlidePanel';
import ConfirmDialog from '../shared/ConfirmDialog';
import StatusBadge from '../shared/StatusBadge';

const emptyForm = {
  clientName: '',
  quote: '',
  companyName: '',
  companyUrl: '',
  isFeatured: false,
  order: 0,
  isActive: true,
};

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) setTestimonials(await res.json());
    } catch {
      // skip
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({ ...emptyForm, order: testimonials.length + 1 });
    setIsPanelOpen(true);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      clientName: item.clientName,
      quote: item.quote,
      companyName: item.companyName || '',
      companyUrl: item.companyUrl || '',
      isFeatured: item.isFeatured ?? false,
      order: item.order || 0,
      isActive: item.isActive ?? true,
    });
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.quote.trim()) return;
    setIsSaving(true);
    try {
      const url = editingItem ? `/api/admin/testimonials/${editingItem._id}` : '/api/admin/testimonials';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(editingItem ? 'Testimonial updated' : 'Testimonial created');
        setIsPanelOpen(false);
        fetchTestimonials();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save');
      }
    } catch {
      showToast('Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Testimonial deleted');
        setDeleteTarget(null);
        fetchTestimonials();
      }
    } catch {
      showToast('Failed to delete testimonial');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1">
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}
            {testimonials.filter(t => t.isFeatured).length > 0 && ` · ${testimonials.filter(t => t.isFeatured).length} featured`}
          </p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && testimonials.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 font-heading mb-1">No testimonials</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first client testimonial.</p>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>
      )}

      {/* Testimonials List */}
      {!isLoading && testimonials.length > 0 && (
        <div className="space-y-3">
          {testimonials.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold font-heading text-gray-900">{item.clientName}</h3>
                    {item.companyName && <span className="text-sm text-gray-400">· {item.companyName}</span>}
                    {item.isFeatured && <StatusBadge status="featured" />}
                    <StatusBadge status={item.isActive ? 'active' : 'hidden'} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  {item.companyUrl && (
                    <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark mt-2">
                      <ExternalLink className="w-3 h-3" /> Visit website
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Client Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.clientName} onChange={(e) => setForm(prev => ({ ...prev, clientName: e.target.value }))} placeholder="e.g. John Smith" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Quote <span className="text-red-500">*</span></label>
            <textarea value={form.quote} onChange={(e) => setForm(prev => ({ ...prev, quote: e.target.value }))} placeholder="What did the client say about your work?" rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Company Name</label>
              <input type="text" value={form.companyName} onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))} placeholder="e.g. Acme Corp" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Company URL</label>
              <input type="url" value={form.companyUrl} onChange={(e) => setForm(prev => ({ ...prev, companyUrl: e.target.value }))} placeholder="https://example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Display Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))} className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700 font-heading">Featured on homepage</p>
              <p className="text-xs text-gray-400">Show this testimonial on the home page</p>
            </div>
            <button type="button" onClick={() => setForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-amber-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700 font-heading">Visible on website</p>
              <p className="text-xs text-gray-400">Show on the testimonials page</p>
            </div>
            <button type="button" onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <button onClick={handleSave} disabled={isSaving || !form.clientName.trim() || !form.quote.trim()} className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {editingItem ? 'Update Testimonial' : 'Create Testimonial'}
          </button>
        </div>
      </SlidePanel>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Testimonial" message={`Delete the testimonial from "${deleteTarget?.clientName}"? This action cannot be undone.`} isLoading={isDeleting} />

      {toast && <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[100]">{toast}</div>}
    </div>
  );
}
