import type { Metadata } from 'next';
import { AdminForm } from '@/components/admin/AdminForm';
import { CheckboxField, TextField } from '@/components/admin/fields';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { getSiteSettings } from '@/lib/content/queries';
import { dateToAccraInput } from '@/lib/validation/shared';
import { saveSettings } from './actions';

export const metadata: Metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  await requireRole('ADMIN');
  const s = await getSiteSettings();
  return (
    <>
      <PageHeader title="Site settings" />
      <AdminForm action={saveSettings}>
        <TextField name="email" label="Group email" type="email" defaultValue={s.email} />
        <TextField name="meetupUrl" label="Meetup link" defaultValue={s.meetupUrl} />
        <TextField name="whatsappUrl" label="WhatsApp community link" defaultValue={s.whatsappUrl} />
        <TextField name="builderCenterUrl" label="AWS Builder Center tracked link" defaultValue={s.builderCenterUrl} help="Use the group leader's tracked link, not a plain builder.aws.com link." />
        <TextField name="linkedinUrl" label="LinkedIn link" defaultValue={s.linkedinUrl} />
        <TextField name="instagramUrl" label="Instagram link" defaultValue={s.instagramUrl} />
        <TextField name="xUrl" label="X link" defaultValue={s.xUrl} />
        <TextField name="membersCount" label="Members on Meetup" type="number" defaultValue={s.membersCount} help="Leave empty to hide this number." />
        <TextField name="departmentsCount" label="Departments represented" type="number" defaultValue={s.departmentsCount} help="Leave empty to hide this number." />
        <TextField name="announcementText" label="Announcement text" defaultValue={s.announcementText} />
        <TextField name="announcementUrl" label="Announcement link" defaultValue={s.announcementUrl} />
        <CheckboxField name="announcementActive" label="Show the announcement bar" defaultChecked={s.announcementActive} />
        <CheckboxField
          name="uccCrestApproved"
          label="Show the UCC crest"
          help="Switch on only after UCC gives written approval."
          defaultChecked={s.uccCrestApproved}
        />
        <h2 className="mt-6 text-lg font-semibold">Builder portal</h2>
        <TextField
          name="memberEmailDomains"
          label="Member email domains"
          defaultValue={s.memberEmailDomains}
          help="Leave empty to let any verified Google account create a member account. Or list domains, separated by commas. Admins can always sign in."
        />
        <h2 className="mt-6 text-lg font-semibold">Student Community Day</h2>
        <TextField name="scdDate" label="Date and start time" type="datetime-local" defaultValue={s.scdDate ? dateToAccraInput(s.scdDate) : ''} help="Ghana time. Only once confirmed." />
        <TextField name="scdVenue" label="Venue" defaultValue={s.scdVenue} />
        <TextField name="scdMapUrl" label="Map link" defaultValue={s.scdMapUrl} />
        <TextField name="scdRegisterUrl" label="Registration link" defaultValue={s.scdRegisterUrl} help="The official registration page for the event." />
        <CheckboxField name="scdPageEnabled" label="Show the Community Day page and nav link" help="Switch on only when the event is confirmed." defaultChecked={s.scdPageEnabled} />
      </AdminForm>
    </>
  );
}
