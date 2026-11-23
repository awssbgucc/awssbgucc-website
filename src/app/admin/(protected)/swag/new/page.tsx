import type { Metadata } from 'next';
import { SwagForm } from '@/components/admin/SwagForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New swag item' };

export default async function NewSwagItemPage() {
  await requireRole();
  return (
    <>
      <PageHeader
        title="New swag item"
        description="Add a new community swag item to track in inventory."
        secondaryAction={{ href: '/admin/swag', label: 'Back to swag' }}
      />
      <SwagForm />
    </>
  );
}
