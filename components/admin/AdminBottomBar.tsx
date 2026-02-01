// components/admin/AdminBottomBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Users,
  Settings,
} from 'lucide-react';

const bottomNavItems = [
  { href: '/admin', label: 'Home', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/portfolio', label: 'Portfolio', icon: FolderOpen },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminBottomBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
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
