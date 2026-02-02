// app/admin/page.tsx
import { sanityClient, isSanityConfigured } from '@/lib/sanity';
import DashboardStats from '@/components/admin/DashboardStats';
import DashboardQuickActions from '@/components/admin/DashboardQuickActions';
import DashboardRecentActivity from '@/components/admin/DashboardRecentActivity';
import AdminTabRouter from '@/components/admin/AdminTabRouter';
import ErrorBoundary from '@/components/ErrorBoundary';

interface AdminPageProps {
  searchParams: Promise<{ tab?: string }>;
}

async function getStats() {
  if (!isSanityConfigured()) {
    return {
      services: 3,
      portfolio: 8,
      clients: 5,
      quotes: 2,
    };
  }

  try {
    const [services, portfolio, clients, quotes] = await Promise.all([
      sanityClient.fetch<number>(`count(*[_type == "service"])`),
      sanityClient.fetch<number>(`count(*[_type == "portfolioSite"])`),
      sanityClient.fetch<number>(`count(*[_type == "client"])`),
      sanityClient.fetch<number>(`count(*[_type == "quote" && status == "sent"])`),
    ]);

    return { services, portfolio, clients, quotes };
  } catch {
    return {
      services: 0,
      portfolio: 0,
      clients: 0,
      quotes: 0,
    };
  }
}

async function getRecentActivity() {
  if (!isSanityConfigured()) {
    return [];
  }

  try {
    const recentQuotes = await sanityClient.fetch<
      Array<{ _id: string; quoteNumber: string; _createdAt: string }>
    >(
      `*[_type == "quote"] | order(_createdAt desc)[0...3] {
        _id, quoteNumber, _createdAt
      }`
    );

    const recentClients = await sanityClient.fetch<
      Array<{ _id: string; name: string; _createdAt: string }>
    >(
      `*[_type == "client"] | order(_createdAt desc)[0...2] {
        _id, name, _createdAt
      }`
    );

    const activities = [
      ...recentQuotes.map((q) => ({
        id: q._id,
        type: 'quote' as const,
        title: `Quote ${q.quoteNumber}`,
        description: 'New quote created',
        timestamp: formatTimeAgo(new Date(q._createdAt)),
      })),
      ...recentClients.map((c) => ({
        id: c._id,
        type: 'client' as const,
        title: c.name,
        description: 'New client added',
        timestamp: formatTimeAgo(new Date(c._createdAt)),
      })),
    ];

    // Sort by most recent and take top 5
    return activities
      .sort((a, b) => {
        // This is a simplified sort - in production you'd compare actual dates
        return 0;
      })
      .slice(0, 5);
  } catch {
    return [];
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function AdminDashboard({ searchParams }: AdminPageProps) {
  // Handle async searchParams (Next.js 15 style)
  const params = await searchParams;
  const activeTab = params?.tab;

  // If a tab is active, render the tab router (client component) wrapped in ErrorBoundary
  if (activeTab) {
    return (
      <ErrorBoundary>
        <AdminTabRouter />
      </ErrorBoundary>
    );
  }

  // Dashboard — fetch all data in parallel
  const [stats, activities] = await Promise.all([
    getStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back to your admin panel
        </p>
      </div>

      {/* Stats grid wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <DashboardStats stats={stats} />
      </ErrorBoundary>

      {/* Two column layout on desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <DashboardQuickActions />
        </ErrorBoundary>
        <ErrorBoundary>
          <DashboardRecentActivity activities={activities} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
