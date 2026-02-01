// components/admin/AdminBottomBar.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Users,
  Settings,
} from 'lucide-react';

const bottomNavItems = [
  { tab: null, label: 'Home', icon: LayoutDashboard },
  { tab: 'services', label: 'Services', icon: Briefcase },
  { tab: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { tab: 'clients', label: 'Clients', icon: Users },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminBottomBar() {
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.tab);

          return (
            <Link
              key={item.tab ?? 'dashboard'}
              href={getHref(item.tab)}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 h-full px-2 transition-colors
                ${active ? 'text-primary' : 'text-gray-500'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium font-heading">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
