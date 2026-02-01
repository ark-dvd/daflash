// app/admin/AdminShell.tsx
'use client';

import { useState } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBottomBar from '@/components/admin/AdminBottomBar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <AdminBottomBar />
      </div>
    </div>
  );
}
