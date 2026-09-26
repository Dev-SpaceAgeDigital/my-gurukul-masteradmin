import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EduTrust SaaS - School Sub Admin',
  description: 'School Administration Portal',
};

export default function SubAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="subadmin-portal min-h-full flex flex-col">{children}</div>;
}
