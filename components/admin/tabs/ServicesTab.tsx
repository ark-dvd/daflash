// components/admin/tabs/ServicesTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Pencil, Trash2, X,
  Globe, Mail, Star, Monitor, Camera, Headphones, Shield,
  Home, MapPin, Users, List, Smartphone, Wrench, FileText,
  LayoutDashboard, FolderOpen, DollarSign, Settings, Zap,
  Eye, EyeOff, Building2, HardHat,
} from 'lucide-react';
import type { Service } from '@/schemas';
import SlidePanel from '../shared/SlidePanel';
import ConfirmDialog from '../shared/ConfirmDialog';
import StatusBadge from '../shared/StatusBadge';

// Icon map — maps icon name strings to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Mail, Star, Monitor, Camera, Headphones, Shield,
  Home, MapPin, Users, List, Smartphone, Wrench, FileText,
  LayoutDashboard, FolderOpen, DollarSign, Settings, Zap,
  Eye, EyeOff, Building2, HardHat,
};

const iconNames = Object.keys(iconMap);

// Empty form state
const emptyForm = {
  name: '',
  icon: 'Globe',
  tagline: '',
  description: '',
  highlights: [] as { title: string; description: string }[],
  order: 0,
  isActive: true,
};

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback
  const [toast, setToast] = useState<string | null>(null);

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch {
      console.error('Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Show toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Open panel for new service
  const handleAdd = () => {
    setEditingService(null);
    setForm({ ...emptyForm, order: services.length + 1 });
    setIsPanelOpen(true);
  };

  // Open panel for editing
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      icon: service.icon || 'Globe',
      tagline: service.tagline || '',
      description: service.description || '',
      highlights: service.highlights || [],
      order: service.order || 0,
      isActive: service.isActive ?? true,
    });
    setIsPanelOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setIsSaving(true);
    try {
      const url = editingService
        ? `/api/admin/services/${editingService._id}`
        : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast(editingService ? 'Service updated' : 'Service created');
        setIsPanelOpen(false);
        fetchServices();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save');
      }
    } catch {
      showToast('Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Service deleted');
        setDeleteTarget(null);
        fetchServices();
      }
    } catch {
      showToast('Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add highlight row
  const addHighlight = () => {
    setForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, { title: '', description: '' }],
    }));
  };

  // Remove highlight row
  const removeHighlight = (index: number) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Update highlight field
  const updateHighlight = (index: number, field: 'title' | 'description', value: string) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? { ...h, [field]: value } : h),
    }));
  };

  // Filter logic
  const filtered = services
    .filter(s => {
      if (filter === 'active') return s.isActive;
      if (filter === 'hidden') return !s.isActive;
      return true;
    })
    .filter(s =>
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Render icon by name
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    const IconComponent = iconMap[iconName] || Globe;
    return <IconComponent className={className} />;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 font-heading mb-1">No services found</h3>
          <p className="text-gray-500 text-sm mb-6">
            {searchQuery || filter !== 'all' ? 'Try adjusting your filters.' : 'Add your first service to get started.'}
          </p>
          {!searchQuery && filter === 'all' && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          )}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white">
                  {renderIcon(service.icon)}
                </div>
                <StatusBadge status={service.isActive ? 'active' : 'hidden'} />
              </div>

              <h3 className="text-base font-semibold font-heading text-gray-900 mb-1">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {service.tagline}
              </p>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(service)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel — Add/Edit Form */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Online Presence"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {iconNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, icon: name }))}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    form.icon === name
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={name}
                >
                  {renderIcon(name, 'w-4 h-4')}
                </button>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Short punchy description"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">
              Full Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed service description..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
            />
          </div>

          {/* Highlights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium font-heading text-gray-700">
                Highlights
              </label>
              <button
                type="button"
                onClick={addHighlight}
                className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {form.highlights.length === 0 && (
              <p className="text-xs text-gray-400 italic">No highlights yet. Click &quot;Add&quot; to create one.</p>
            )}
            <div className="space-y-3">
              {form.highlights.map((h, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 relative">
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <input
                    type="text"
                    value={h.title}
                    onChange={(e) => updateHighlight(i, 'title', e.target.value)}
                    placeholder="Highlight title"
                    className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={h.description}
                    onChange={(e) => updateHighlight(i, 'description', e.target.value)}
                    placeholder="Highlight description"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium font-heading text-gray-700 mb-1.5">
              Display Order
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <p className="text-xs text-gray-400 mt-1">Lower numbers appear first.</p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700 font-heading">Visible on website</p>
              <p className="text-xs text-gray-400">Show this service on the public site</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isActive ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !form.name.trim()}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {editingService ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </SlidePanel>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
}
