// components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  FolderOpen,
  MessageSquareQuote,
  FileText,
  Receipt,
  Settings,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { tab: null, label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'services', label: 'Services', icon: Briefcase },
  { tab: 'pricing', label: 'Pricing', icon: CreditCard },
  { tab: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { tab: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { tab: 'landing-pages', label: 'Landing Pages', icon: FileText },
  { tab: 'quotes-invoices', label: 'Quotes & Invoices', icon: Receipt },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const isActive = (tab: string | null) => {
    if (tab === null) {
      return currentTab === null;
    }
    return currentTab === tab;
  };

  const getHref = (tab: string | null) => {
    if (tab === null) return '/admin';
    return `/admin?tab=${tab}`;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl text-white">
              daflash
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)] scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.tab);

            return (
              <Link
                key={item.tab ?? 'dashboard'}
                href={getHref(item.tab)}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200
                  ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
