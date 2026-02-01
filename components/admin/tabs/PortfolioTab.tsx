// components/admin/tabs/PortfolioTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, FolderOpen } from 'lucide-react';
import type { PortfolioSite } from '@/schemas';
import SlidePanel from '../shared/SlidePanel';
import ConfirmDialog from '../shared/ConfirmDialog';
import StatusBadge from '../shared/StatusBadge';
import ImageUpload from '../shared/ImageUpload';

const emptyForm = {
  clientName: '',
  logo: undefined as string | undefined,
  logoUrl: null as string | null,
  websiteUrl: '',
  order: 0,
  isActive: true,
};

export default function PortfolioTab() {
  const [sites, setSites] = useState<PortfolioSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<PortfolioSite | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioSite | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/portfolio');
      if (res.ok) setSites(await res.json());
    } catch {
      // skip
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setEditingSite(null);
    setForm({ ...emptyForm, order: sites.length + 1 });
    setIsPanelOpen(true);
  };

  const handleEdit = (site: PortfolioSite) => {
    setEditingSite(site);
    setForm({
      clientName: site.clientName,
      logo: undefined, // Don't send existing logo as asset ID
      logoUrl: site.logo?.asset?.url || null,
      websiteUrl: site.websiteUrl || '',
      order: site.order || 0,
      isActive: site.isActive ?? true,
    });
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) return;
    setIsSaving(true);
    try {
      const url = editingSite ? `/api/admin/portfolio/${editingSite._id}` : '/api/admin/portfolio';
      const method = editingSite ? 'PUT' : 'POST';

      // Only send logo field if a new image was uploaded
      const body: Record<string, unknown> = {
        clientName: form.clientName,
        websiteUrl: form.websiteUrl,
        order: form.order,
        isActive: form.isActive,
      };
      if (form.logo) body.logo = form.logo;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast(editingSite ? 'Site updated' : 'Site added');
        setIsPanelOpen(false);
        fetchSites();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save');
      }
    } catch {
      showToast('Failed to save site');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Site removed');
        setDeleteTarget(null);
        fetchSites();
      }
    } catch {
      showToast('Failed to delete site');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">{sites.length} website{sites.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Website
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && sites.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 font-heading mb-1">No portfolio sites</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first client website to showcase.</p>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Website
          </button>
        </div>
      )}

      {/* Portfolio Grid */}
      {!isLoading && sites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sites.map((site) => (
            <div key={site._id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group text-center">
              {/* Logo */}
              <div className="w-full h-20 flex items-center justify-center mb-3 bg-gray-50 rounded-xl overflow-hidden">
                {site.logo?.asset?.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={site.logo.asset.url} alt={site.clientName} className="max-h-12 max-w-[80%] object-contain" />
                ) : (
                  <span className="text-sm font-semibold text-gray-400 font-heading">{site.clientName.charAt(0)}</span>
                )}
              </div>

              <h3 className="text-sm font-semibold font-heading text-gray-900 mb-1 truncate">{site.clientName}</h3>

              <div className="flex items-center justify-center gap-1 mb-3">
                <StatusBadge status={site.isActive ? 'active' : 'hidden'} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {site.websiteUrl && (
                  <a href={site.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => handleEdit(site)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(site)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingSite ? 'Edit Website' : 'Add Website'}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Client Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.clientName} onChange={(e) => setForm(prev => ({ ...prev, clientName: e.target.value }))} placeholder="e.g. WDI Global" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <ImageUpload
            currentImageUrl={form.logoUrl}
            onUpload={(assetId, url) => setForm(prev => ({ ...prev, logo: assetId, logoUrl: url }))}
            onRemove={() => setForm(prev => ({ ...prev, logo: undefined, logoUrl: null }))}
            label="Client Logo"
          />

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Website URL</label>
            <input type="url" value={form.websiteUrl} onChange={(e) => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))} placeholder="https://example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">Display Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))} className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700 font-heading">Visible on website</p>
              <p className="text-xs text-gray-400">Show in the portfolio section</p>
            </div>
            <button type="button" onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <button onClick={handleSave} disabled={isSaving || !form.clientName.trim()} className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {editingSite ? 'Update Website' : 'Add Website'}
          </button>
        </div>
      </SlidePanel>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove Website" message={`Remove "${deleteTarget?.clientName}" from your portfolio?`} isLoading={isDeleting} />

      {toast && <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[100]">{toast}</div>}
    </div>
  );
}
