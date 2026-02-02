// components/admin/AdminTopBar.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo - visible on mobile only (desktop has sidebar) */}
        <div className="lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-color.svg" alt="daflash" className="h-8 w-auto" />
        </div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 font-heading">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {session?.user?.email}
              </p>
            </div>
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full"
                  unoptimized
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-medium text-gray-900 font-heading">
                    {session?.user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
