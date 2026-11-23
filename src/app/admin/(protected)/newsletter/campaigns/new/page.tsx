import type { Metadata } from 'next';
import Link from 'next/link';
import { CampaignForm } from '@/components/admin/CampaignForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'Compose update' };

export default async function NewCampaignPage() {
  await requireRole();
  return (
    <>
      <div className="mb-4">
        <Link href="/admin/newsletter?tab=campaigns" className="text-xs font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
          Back to campaigns
        </Link>
      </div>
      <PageHeader title="Compose update" description="Write a Markdown update, test it on your inbox and send to active subscribers." />
      <CampaignForm />
    </>
  );
}
