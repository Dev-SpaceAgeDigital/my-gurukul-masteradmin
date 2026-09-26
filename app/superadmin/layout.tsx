import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EduTrust SaaS - Trust Super Admin',
  description: 'Trust Super Administrative Control Center',
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
