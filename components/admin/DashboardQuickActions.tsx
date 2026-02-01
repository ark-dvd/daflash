// components/admin/DashboardQuickActions.tsx
import Link from 'next/link';
import {
  Plus,
  FileText,
  UserPlus,
  FolderPlus,
  Upload,
} from 'lucide-react';

const quickActions = [
  {
    href: '/admin/quotes/new',
    label: 'New Quote',
    description: 'Create a quote for a client',
    icon: FileText,
    color: 'bg-primary/10 text-primary',
  },
  {
    href: '/admin/clients/new',
    label: 'Add Client',
    description: 'Register a new client',
    icon: UserPlus,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/admin/portfolio/new',
    label: 'Add Project',
    description: 'Showcase your work',
    icon: FolderPlus,
    color: 'bg-green-50 text-green-600',
  },
  {
    href: '/admin/services/new',
    label: 'New Service',
    description: 'Add a new service',
    icon: Plus,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function DashboardQuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-gray-900">Quick Actions</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 font-heading">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {action.description}
                </p>
              </div>
              <Upload className="w-4 h-4 text-gray-400 rotate-90" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
