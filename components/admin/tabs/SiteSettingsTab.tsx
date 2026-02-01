// components/admin/tabs/SiteSettingsTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Palette,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
} from 'lucide-react';
import Accordion from '../shared/Accordion';
import ImageUpload from '../shared/ImageUpload';

interface AboutStat {
  value: string;
  label: string;
}

interface FormState {
  // Hero
  heroHeadline: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImage: string;
  heroImageUrl: string;
  // About / Company
  companyName: string;
  companySpecialty: string;
  aboutHeadline: string;
  aboutText: string;
  aboutStats: AboutStat[];
  // Contact
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  serviceArea: string;
  officeHours: string;
  // Branding
  logo: string;
  logoUrl: string;
  favicon: string;
  faviconUrl: string;
  // Social
  socialInstagram: string;
  socialFacebook: string;
  socialLinkedin: string;
  socialYoutube: string;
}

const emptyForm: FormState = {
  heroHeadline: '',
  heroSubtitle: '',
  heroCtaText: '',
  heroCtaLink: '',
  heroImage: '',
  heroImageUrl: '',
  companyName: '',
  companySpecialty: '',
  aboutHeadline: '',
  aboutText: '',
  aboutStats: [],
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  serviceArea: '',
  officeHours: '',
  logo: '',
  logoUrl: '',
  favicon: '',
  faviconUrl: '',
  socialInstagram: '',
  socialFacebook: '',
  socialLinkedin: '',
  socialYoutube: '',
};

export default function SiteSettingsTab() {
  const [form, setForm] = useState<FormState>(emptyForm);
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
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setForm({
            heroHeadline: data.heroHeadline || '',
            heroSubtitle: data.heroSubtitle || '',
            heroCtaText: data.heroCtaText || '',
            heroCtaLink: data.heroCtaLink || '',
            heroImage: data.heroImage?.asset?._ref || data.heroImage || '',
            heroImageUrl: data.heroImage?.asset?.url || '',
            companyName: data.companyName || '',
            companySpecialty: data.companySpecialty || '',
            aboutHeadline: data.aboutHeadline || '',
            aboutText: data.aboutText || '',
            aboutStats: data.aboutStats || [],
            contactPhone: data.contactPhone || '',
            contactEmail: data.contactEmail || '',
            contactAddress: data.contactAddress || '',
            serviceArea: data.serviceArea || '',
            officeHours: data.officeHours || '',
            logo: data.logo?.asset?._ref || data.logo || '',
            logoUrl: data.logo?.asset?.url || '',
            favicon: data.favicon?.asset?._ref || data.favicon || '',
            faviconUrl: data.favicon?.asset?.url || '',
            socialInstagram: data.socialInstagram || '',
            socialFacebook: data.socialFacebook || '',
            socialLinkedin: data.socialLinkedin || '',
            socialYoutube: data.socialYoutube || '',
          });
        }
      }
    } catch {
      // Keep empty form on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        heroHeadline: form.heroHeadline,
        heroSubtitle: form.heroSubtitle,
        heroCtaText: form.heroCtaText,
        heroCtaLink: form.heroCtaLink,
        companyName: form.companyName,
        companySpecialty: form.companySpecialty,
        aboutHeadline: form.aboutHeadline,
        aboutText: form.aboutText,
        aboutStats: form.aboutStats,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        contactAddress: form.contactAddress,
        serviceArea: form.serviceArea,
        officeHours: form.officeHours,
        socialInstagram: form.socialInstagram,
        socialFacebook: form.socialFacebook,
        socialLinkedin: form.socialLinkedin,
        socialYoutube: form.socialYoutube,
      };

      if (form.heroImage) body.heroImage = form.heroImage;
      if (form.logo) body.logo = form.logo;
      if (form.favicon) body.favicon = form.favicon;

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast('Settings saved successfully', 'success');
        setIsDirty(false);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof FormState, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const addStat = () => {
    setForm(prev => ({
      ...prev,
      aboutStats: [...prev.aboutStats, { value: '', label: '' }],
    }));
    setIsDirty(true);
  };

  const removeStat = (index: number) => {
    setForm(prev => ({
      ...prev,
      aboutStats: prev.aboutStats.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    setForm(prev => ({
      ...prev,
      aboutStats: prev.aboutStats.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const socialFields = [
    { key: 'socialInstagram' as const, label: 'Instagram', Icon: Instagram, placeholder: 'https://instagram.com/daflash' },
    { key: 'socialFacebook' as const, label: 'Facebook', Icon: Facebook, placeholder: 'https://facebook.com/daflash' },
    { key: 'socialLinkedin' as const, label: 'LinkedIn', Icon: Linkedin, placeholder: 'https://linkedin.com/company/daflash' },
    { key: 'socialYoutube' as const, label: 'YouTube', Icon: Youtube, placeholder: 'https://youtube.com/@daflash' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global settings for your website</p>
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
              placeholder="e.g., Domain. Email. Website. In 24 Hours."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
            <textarea
              rows={2}
              value={form.heroSubtitle}
              onChange={(e) => updateField('heroSubtitle', e.target.value)}
              placeholder="e.g., Your business deserves more than a Gmail address..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Text</label>
              <input
                type="text"
                value={form.heroCtaText}
                onChange={(e) => updateField('heroCtaText', e.target.value)}
                placeholder="e.g., Get Started"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Link</label>
              <input
                type="text"
                value={form.heroCtaLink}
                onChange={(e) => updateField('heroCtaLink', e.target.value)}
                placeholder="e.g., /contact"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
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

      {/* About / Company Info */}
      <Accordion title="About / Company Info">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="e.g., daflash"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
              <input
                type="text"
                value={form.companySpecialty}
                onChange={(e) => updateField('companySpecialty', e.target.value)}
                placeholder="e.g., Digital Services & IT Solutions"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">About Headline</label>
            <input
              type="text"
              value={form.aboutHeadline}
              onChange={(e) => updateField('aboutHeadline', e.target.value)}
              placeholder="e.g., About Us"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">About Text</label>
            <textarea
              rows={4}
              value={form.aboutText}
              onChange={(e) => updateField('aboutText', e.target.value)}
              placeholder="Tell your story..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y"
            />
          </div>

          {/* Statistics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
            <div className="space-y-3">
              {form.aboutStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                        placeholder="e.g., 50+"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                        placeholder="e.g., Websites Launched"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStat(index)}
                    className="p-1 text-gray-400 hover:text-red-500 mt-5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStat}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Statistic
              </button>
            </div>
          </div>
        </div>
      </Accordion>

      {/* Contact Information */}
      <Accordion title="Contact Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 text-gray-400" /> Phone
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                placeholder="e.g., (512) 555-0100"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Mail className="w-4 h-4 text-gray-400" /> Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="e.g., contact@daflash.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <MapPin className="w-4 h-4 text-gray-400" /> Address
            </label>
            <input
              type="text"
              value={form.contactAddress}
              onChange={(e) => updateField('contactAddress', e.target.value)}
              placeholder="e.g., Austin, TX"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Globe className="w-4 h-4 text-gray-400" /> Service Area
              </label>
              <input
                type="text"
                value={form.serviceArea}
                onChange={(e) => updateField('serviceArea', e.target.value)}
                placeholder="e.g., Austin, TX & Surrounding Areas"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Clock className="w-4 h-4 text-gray-400" /> Office Hours
              </label>
              <input
                type="text"
                value={form.officeHours}
                onChange={(e) => updateField('officeHours', e.target.value)}
                placeholder="e.g., Mon-Fri 9am-6pm"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Branding */}
      <Accordion title="Branding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400" />
                Logo
              </div>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Recommended: SVG or PNG with transparent background
              </p>
            </label>
            <ImageUpload
              currentImageUrl={form.logoUrl}
              onUpload={(assetId, url) => {
                setForm(prev => ({ ...prev, logo: assetId, logoUrl: url }));
                setIsDirty(true);
              }}
              onRemove={() => {
                setForm(prev => ({ ...prev, logo: '', logoUrl: '' }));
                setIsDirty(true);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Favicon
              </div>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Recommended: 32x32 PNG or ICO
              </p>
            </label>
            <ImageUpload
              currentImageUrl={form.faviconUrl}
              onUpload={(assetId, url) => {
                setForm(prev => ({ ...prev, favicon: assetId, faviconUrl: url }));
                setIsDirty(true);
              }}
              onRemove={() => {
                setForm(prev => ({ ...prev, favicon: '', faviconUrl: '' }));
                setIsDirty(true);
              }}
            />
          </div>
        </div>
      </Accordion>

      {/* Social Media */}
      <Accordion title="Social Media">
        <div className="space-y-4">
          {socialFields.map(({ key, label, Icon, placeholder }) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  form[key] ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="url"
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                />
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-6 ${
                  form[key] ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            </div>
          ))}
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
