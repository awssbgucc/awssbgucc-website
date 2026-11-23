import { saveCampaign } from '@/app/admin/(protected)/newsletter/actions';
import type { NewsletterCampaign } from '@/lib/content/types';
import { AdminForm } from './AdminForm';
import { MarkdownField, TextField } from './fields';

export function CampaignForm({ campaign }: { campaign?: NewsletterCampaign }) {
  return (
    <AdminForm action={saveCampaign.bind(null, campaign?.id ?? null)} submitLabel={campaign ? 'Save draft' : 'Create draft'} wide>
      <TextField
        name="subject"
        label="Email subject"
        defaultValue={campaign?.subject}
        help="Keep it concise and descriptive, up to 140 characters."
      />
      <TextField
        name="previewText"
        label="Preview line"
        defaultValue={campaign?.previewText}
        help="Optional short line shown beside the subject in email inboxes."
      />
      <MarkdownField
        name="body"
        label="Body"
        rows={14}
        defaultValue={campaign?.body}
        help="Supports Markdown headings (#, ##), lists (- item), bold (**text**) and HTTPS links."
      />
    </AdminForm>
  );
}
