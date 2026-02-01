// components/admin/shared/StatusBadge.tsx

interface StatusBadgeProps {
  status: 'active' | 'hidden' | 'featured';
  className?: string;
}

const styles = {
  active: 'bg-green-100 text-green-700',
  hidden: 'bg-gray-100 text-gray-500',
  featured: 'bg-amber-100 text-amber-700',
};

const labels = {
  active: 'Active',
  hidden: 'Hidden',
  featured: 'Featured',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
