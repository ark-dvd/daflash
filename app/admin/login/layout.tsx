// app/admin/login/layout.tsx
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Sign In | daflash Admin',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
