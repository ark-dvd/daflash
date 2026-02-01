// components/admin/tabs/LandingPageEditor.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Globe,
  Mail,
  Star,
  Monitor,
  Camera,
  Headphones,
  Shield,
  Home,
  MapPin,
  Users,
  List,
  Smartphone,
  Wrench,
  FileText,
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  Settings,
  Zap,
  Eye,
  EyeOff,
  Building2,
  HardHat,
} from 'lucide-react';
import Accordion from '../shared/Accordion';
import ImageUpload from '../shared/ImageUpload';

// Icon options for feature picker
const ICON_OPTIONS = [
  { name: 'Globe', Icon: Globe },
  { name: 'Mail', Icon: Mail },
  { name: 'Star', Icon: Star },
  { name: 'Monitor', Icon: Monitor },
  { name: 'Camera', Icon: Camera },
  { name: 'Headphones', Icon: Headphones },
  { name: 'Shield', Icon: Shield },
  { name: 'Home', Icon: Home },
  { name: 'MapPin', Icon: MapPin },
  { name: 'Users', Icon: Users },
  { name: 'List', Icon: List },
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Wrench', Icon: Wrench },
  { name: 'FileText', Icon: FileText },
  { name: 'LayoutDashboard', Icon: LayoutDashboard },
  { name: 'FolderOpen', Icon: FolderOpen },
  { name: 'DollarSign', Icon: DollarSign },
  { name: 'Settings', Icon: Settings },
  { name: 'Zap', Icon: Zap },
  { name: 'Eye', Icon: Eye },
  { name: 'EyeOff', Icon: EyeOff },
  { name: 'Building2', Icon: Building2 },
  { name: 'HardHat', Icon: HardHat },
];

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface LandingPageEditorProps {
  pageId: 'realtors' | 'contractors';
}

const emptyForm = {
  heroHeadline: '',
  heroSubtitle: '',
  heroImage: '',
  heroImageUrl: '',
  features: [] as Feature[],
  whiteLabelText: '',
  ctaText: '',
  ctaLink: '',
};

export default function LandingPageEditor({ pageId }: LandingPageEditorProps) {
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/landing-pages/${pageId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setForm({
            heroHeadline: data.heroHeadline || '',
            heroSubtitle: data.heroSubtitle || '',
            heroImage: data.heroImage?.asset?._ref || data.heroImage || '',
            heroImageUrl: data.heroImage?.asset?.url || '',
            features: data.features || [],
            whiteLabelText: data.whiteLabelText || '',
            ctaText: data.ctaText || '',
            ctaLink: data.ctaLink || '',
          });
        }
      }
    } catch {
      // Keep empty form on error
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        heroHeadline: form.heroHeadline,
        heroSubtitle: form.heroSubtitle,
        features: form.features,
        whiteLabelText: form.whiteLabelText,
        ctaText: form.ctaText,
        ctaLink: form.ctaLink,
      };
      if (form.heroImage) {
        body.heroImage = form.heroImage;
      }

      const res = await fetch(`/api/admin/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast('Changes saved successfully', 'success');
        setIsDirty(false);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      showToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const addFeature = () => {
    setForm(prev => ({
      ...prev,
      features: [...prev.features, { icon: 'Star', title: '', description: '' }],
    }));
    setIsDirty(true);
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
    setIsDirty(true);
  };

  const getIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(opt => opt.name === iconName);
    return found ? found.Icon : Star;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle = pageId === 'realtors' ? 'Realtor Landing Page' : 'Contractor Landing Page';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize the content for the /{pageId} landing page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            isDirty && !isSaving
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
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <Accordion title="Hero Section" defaultOpen>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Headline</label>
            <input
              type="text"
              value={form.heroHeadline}
              onChange={(e) => updateField('heroHeadline', e.target.value)}
              placeholder={pageId === 'realtors' ? 'e.g., Websites for Real Estate Agents' : 'e.g., Websites for Contractors'}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
            <textarea
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) => updateField('heroSubtitle', e.target.value)}
              placeholder="Enter a compelling subtitle..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
            />
          </div>
          <ImageUpload
            currentImageUrl={form.heroImageUrl}
            onUpload={(assetId, url) => {
              setForm(prev => ({ ...prev, heroImage: assetId, heroImageUrl: url }));
              setIsDirty(true);
            }}
            onRemove={() => {
              setForm(prev => ({ ...prev, heroImage: '', heroImageUrl: '' }));
              setIsDirty(true);
            }}
            label="Background Image"
          />
        </div>
      </Accordion>

      {/* Features Section */}
      <Accordion title="Features" badge={`${form.features.length} features`}>
        <div className="space-y-3">
          {form.features.map((feature, index) => {
            const FeatureIcon = getIconComponent(feature.icon);
            return (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="font-heading font-semibold text-sm text-gray-700">
                      {feature.title || `Feature ${index + 1}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Icon Picker */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {ICON_OPTIONS.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => updateFeature(index, 'icon', name)}
                        className={`p-2 rounded-lg transition-colors ${
                          feature.icon === name
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title={name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    placeholder="Feature title"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    placeholder="Feature description"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm resize-y"
                  />
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addFeature}
            className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>
      </Accordion>

      {/* White Label Section */}
      <Accordion title="White Label Section">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">White Label Text</label>
          <textarea
            rows={4}
            value={form.whiteLabelText}
            onChange={(e) => updateField('whiteLabelText', e.target.value)}
            placeholder="e.g., Your Brand. Your Domain. Fully Yours. No mention of us anywhere..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
          />
        </div>
      </Accordion>

      {/* Call to Action Section */}
      <Accordion title="Call to Action">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
            <input
              type="text"
              value={form.ctaText}
              onChange={(e) => updateField('ctaText', e.target.value)}
              placeholder="e.g., Contact for Quote"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Link</label>
            <input
              type="text"
              value={form.ctaLink}
              onChange={(e) => updateField('ctaLink', e.target.value)}
              placeholder="e.g., /contact"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
        </div>
      </Accordion>

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
