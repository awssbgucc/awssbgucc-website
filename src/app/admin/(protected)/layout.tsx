import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { requireRole } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireRole();
  return (
    <div className="min-h-dvh bg-bg-alt lg:flex">
      <Sidebar role={admin.role} email={admin.email} />
      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
