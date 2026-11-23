import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CampaignForm } from '@/components/admin/CampaignForm';
import { CampaignSendPanel } from '@/components/admin/CampaignSendPanel';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { PageHeader, Panel, StatusPill } from '@/components/admin/ui';
import { Markdown } from '@/components/site/Markdown';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { isResendConfigured } from '@/lib/email/newsletter';
import { formatDate, formatTime } from '@/lib/format';
import { deleteCampaign } from '../../actions';

export const metadata: Metadata = { title: 'Newsletter update' };

type Props = { params: Promise<{ id: string }> };

export default async function EditCampaignPage({ params }: Props) {
  const admin = await requireRole();
  const { id } = await params;
  const [campaign, subscriberCount] = await Promise.all([
    db.newsletterCampaign.findUnique({ where: { id } }),
    db.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
  ]);
  if (!campaign) notFound();

  const resendConfigured = isResendConfigured();
  const sent = campaign.status === 'SENT';

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/newsletter?tab=campaigns" className="text-xs font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
          Back to campaigns
        </Link>
      </div>
      <PageHeader
        title={campaign.subject}
        description={
          sent && campaign.sentAt
            ? `Sent to ${campaign.sentCount} subscribers on ${formatDate(campaign.sentAt)} at ${formatTime(campaign.sentAt)}${campaign.sentBy ? ` by ${campaign.sentBy}` : ''}.`
            : 'Draft campaign. Save changes before sending a test or broadcasting.'
        }
      />

      {sent ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <StatusPill published labels={['Draft', 'Sent']} />
            {campaign.previewText && <span className="text-sm text-text-muted">{campaign.previewText}</span>}
          </div>
          <Panel title="Sent email body">
            <Markdown>{campaign.body}</Markdown>
          </Panel>
          <div className="border-t border-border pt-6">
            <ConfirmAction
              action={deleteCampaign.bind(null, campaign.id)}
              label="Delete campaign"
              question="Remove this campaign record from history?"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <CampaignSendPanel
            campaignId={campaign.id}
            subscriberCount={subscriberCount}
            adminEmail={admin.email}
            resendConfigured={resendConfigured}
          />
          <CampaignForm campaign={campaign} />
          <div className="border-t border-border pt-6">
            <ConfirmAction action={deleteCampaign.bind(null, campaign.id)} label="Delete draft" question="This cannot be undone." />
          </div>
        </div>
      )}
    </>
  );
}
