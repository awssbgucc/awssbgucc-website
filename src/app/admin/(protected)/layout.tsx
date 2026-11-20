import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { requireRole } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireRole();
  return (
    <div className="min-h-dvh bg-bg-alt lg:flex">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
        Skip to content
      </a>
      <Sidebar role={admin.role} email={admin.email} />
      <main id="admin-main" className="min-w-0 flex-1 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
