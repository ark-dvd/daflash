// components/admin/DashboardRecentActivity.tsx
import {
  FileText,
  User,
  FolderOpen,
  CreditCard,
  Clock,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'quote' | 'client' | 'project' | 'invoice';
  title: string;
  description: string;
  timestamp: string;
}

interface DashboardRecentActivityProps {
  activities: ActivityItem[];
}

const typeConfig = {
  quote: {
    icon: FileText,
    color: 'bg-primary/10 text-primary',
  },
  client: {
    icon: User,
    color: 'bg-blue-50 text-blue-600',
  },
  project: {
    icon: FolderOpen,
    color: 'bg-green-50 text-green-600',
  },
  invoice: {
    icon: CreditCard,
    color: 'bg-purple-50 text-purple-600',
  },
};

export default function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-400 mt-1">
            Actions will appear here as you work
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="flex items-start gap-4 px-5 py-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {activity.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
