// components/public/ContactForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const serviceOptions = [
  {
    category: 'Online Presence',
    items: ['Domain Registration', 'Professional Email Setup', 'Logo Design', 'Website Design'],
  },
  {
    category: 'Drone Services',
    items: ['Indoor', 'Outdoor'],
  },
  {
    category: 'IT Services',
    items: ['Fractional IT Admin', 'Ongoing IT Support'],
  },
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add selected services
    selectedServices.forEach((service) => {
      formData.append('services', service);
    });

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      setSubmitted(true);
    } catch {
      // Fallback: let the form submit naturally
      form.submit();
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-md text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="font-heading text-xl font-bold mb-2">Message Sent!</h3>
        <p className="text-df-gray">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-8 md:p-10 shadow-md"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          Don&apos;t fill this out: <input name="bot-field" />
        </label>
      </p>

      {/* Name */}
      <div className="mb-5">
        <label htmlFor="name" className="block font-heading text-sm font-medium text-df-gray-dark mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3.5 text-[15px] border border-black/10 rounded-lg bg-white transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* Email */}
      <div className="mb-5">
        <label htmlFor="email" className="block font-heading text-sm font-medium text-df-gray-dark mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3.5 text-[15px] border border-black/10 rounded-lg bg-white transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* Company */}
      <div className="mb-5">
        <label htmlFor="company" className="block font-heading text-sm font-medium text-df-gray-dark mb-2">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          className="w-full px-4 py-3.5 text-[15px] border border-black/10 rounded-lg bg-white transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* Service Selection Chips */}
      <div className="mb-5">
        <label className="block font-heading text-sm font-medium text-df-gray-dark mb-3">
          I&apos;m interested in...
        </label>
        <div className="flex flex-col gap-4">
          {serviceOptions.map((group) => (
            <div key={group.category}>
              <span className="block font-heading text-xs font-semibold text-df-gray uppercase tracking-wide mb-2">
                {group.category}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleService(item)}
                    className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${
                      selectedServices.includes(item)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-df-gray-light text-df-gray-dark border-transparent hover:border-primary hover:bg-primary-light'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label htmlFor="message" className="block font-heading text-sm font-medium text-df-gray-dark mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full px-4 py-3.5 text-[15px] border border-black/10 rounded-lg bg-white transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light resize-y min-h-[120px]"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full btn bg-primary text-white font-heading font-semibold py-4 rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? 'Sending...' : 'Send Message'}
        {!submitting && <Send size={18} />}
      </button>
    </form>
  );
}
