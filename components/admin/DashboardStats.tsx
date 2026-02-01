// components/admin/DashboardStats.tsx
import {
  Briefcase,
  FolderOpen,
  Users,
  Receipt,
  TrendingUp,
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'primary' | 'blue' | 'green' | 'purple';
}

function StatCard({ label, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
            <TrendingUp className={`w-3 h-3 ${!trend.isPositive && 'rotate-180'}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 font-heading mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

interface DashboardStatsProps {
  stats: {
    services: number;
    portfolio: number;
    clients: number;
    quotes: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Services"
        value={stats.services}
        icon={Briefcase}
        color="primary"
      />
      <StatCard
        label="Portfolio"
        value={stats.portfolio}
        icon={FolderOpen}
        color="blue"
      />
      <StatCard
        label="Clients"
        value={stats.clients}
        icon={Users}
        color="green"
      />
      <StatCard
        label="Active Quotes"
        value={stats.quotes}
        icon={Receipt}
        color="purple"
      />
    </div>
  );
}
