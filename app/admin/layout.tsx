// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import Providers from '@/components/Providers';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'Admin | daflash',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
