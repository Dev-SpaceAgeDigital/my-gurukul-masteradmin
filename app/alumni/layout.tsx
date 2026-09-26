import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Madni Education - Alumni Hub',
  description: 'Alumni Engagement & Achievement Portal',
};

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="alumni-portal h-full">{children}</div>;
}
