import { saveEvent } from '@/app/admin/(protected)/events/actions';
import type { Event } from '@/lib/content/types';
import { dateToAccraInput } from '@/lib/validation/shared';
import { AdminForm } from './AdminForm';
import { MarkdownField, SelectField, TextArea, TextField } from './fields';

const TAGS = [
  { value: 'BOOTCAMP', label: 'Bootcamp' },
  { value: 'BUILD', label: 'Build session' },
  { value: 'TALK', label: 'Talk' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'COMMUNITY_DAY', label: 'Community Day' },
];

const FORMATS = [
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'ONLINE', label: 'Online' },
];

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function EventForm({ event }: { event?: Event }) {
  return (
    <AdminForm action={saveEvent.bind(null, event?.id ?? null)}>
      <TextField name="title" label="Title" defaultValue={event?.title} />
      <TextField name="slug" label="Slug" defaultValue={event?.slug} help="Used in the link. Leave empty to generate it from the title." />
      <SelectField name="tag" label="Tag" options={TAGS} defaultValue={event?.tag} />
      <SelectField name="format" label="Format" options={FORMATS} defaultValue={event?.format} />
      <TextField name="startsAt" label="Start" type="datetime-local" defaultValue={event && dateToAccraInput(event.startsAt)} help="Ghana time." />
      <TextField name="endsAt" label="End" type="datetime-local" defaultValue={event && dateToAccraInput(event.endsAt)} help="Ghana time." />
      <TextField name="venue" label="Venue" defaultValue={event?.venue} help="Needed to publish an in-person event." />
      <TextArea name="summary" label="Summary" defaultValue={event?.summary} help="Shown on cards. 200 characters at most." />
      <MarkdownField name="body" label="Body" defaultValue={event?.body} help="Markdown." />
      <TextField name="meetupUrl" label="Meetup link" defaultValue={event?.meetupUrl} help="Needed to publish." />
      <TextField name="attendance" label="Attendance" type="number" defaultValue={event?.attendance} help="After the event, from the attendance sheet." />
      <SelectField name="status" label="Status" options={STATUSES} defaultValue={event?.status} />
    </AdminForm>
  );
}
