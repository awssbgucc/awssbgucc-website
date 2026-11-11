import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminForm } from '@/components/admin/AdminForm';
import { CheckboxField, SelectField, TextArea, TextField } from '@/components/admin/fields';
import { InterestsField } from '@/components/builder/InterestsField';
import { ProfileCard } from '@/components/builder/ProfileCard';
import { PageTitle, Panel } from '@/components/builder/ui';
import { LEVELS_OF_STUDY, OPTIONS, ownedKeys, type CustomKind } from '@/lib/platform/customise';
import { requireMember } from '@/lib/member';
import { memberRecord, ownedRewardValues } from '@/lib/platform/member-data';
import { applyCustomisation, saveProfile } from '../../actions/profile';
import { DataControls } from './DataControls';

export const metadata: Metadata = { title: 'Profile' };

const VISIBILITY = [
  { value: 'PRIVATE', label: 'Only me and the core team' },
  { value: 'MEMBERS', label: 'Signed-in members' },
  { value: 'PUBLIC', label: 'Anyone, on a public profile page' },
];

const CUSTOM: { kind: CustomKind; field: 'bannerKey' | 'accentKey' | 'frameKey' | 'titleKey'; title: string }[] = [
  { kind: 'BANNER', field: 'bannerKey', title: 'Banner' },
  { kind: 'ACCENT', field: 'accentKey', title: 'Accent' },
  { kind: 'FRAME', field: 'frameKey', title: 'Frame' },
  { kind: 'TITLE', field: 'titleKey', title: 'Title' },
];

export default async function ProfilePage() {
  const { user, profile } = await requireMember();
  const [owned, record] = await Promise.all([ownedRewardValues(user.id), memberRecord(user.id)]);

  return (
    <>
      <PageTitle label="Profile" title="Your profile" intro={`Signed in as ${user.email}. Your email is never shown to other members.`} />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Panel title="Details and privacy">
            <AdminForm action={saveProfile} submitLabel="Save profile">
              <TextField name="displayName" label="Name" defaultValue={profile.displayName} />
              <TextField name="handle" label="Handle" defaultValue={profile.handle} help="Lowercase letters, numbers and hyphens. Changing it changes your profile link." />
              <TextField name="programme" label="Programme" defaultValue={profile.programme} />
              <SelectField name="level" label="Level" defaultValue={profile.level ?? ''} options={[{ value: '', label: 'Prefer not to say' }, ...LEVELS_OF_STUDY.map((l) => ({ value: l, label: l }))]} />
              <TextField name="department" label="Department" defaultValue={profile.department} />
              <TextArea name="bio" label="A line about you" defaultValue={profile.bio} help="280 characters at most." />
              <InterestsField selected={profile.interests} />
              <TextField name="githubUrl" label="GitHub" defaultValue={profile.githubUrl} />
              <TextField name="linkedinUrl" label="LinkedIn" defaultValue={profile.linkedinUrl} />
              <SelectField name="visibility" label="Who can see your profile" defaultValue={profile.visibility} options={VISIBILITY} />
              <CheckboxField name="showOnLeaderboards" label="Show my name on challenge leaderboards" defaultChecked={profile.showOnLeaderboards} />
              <CheckboxField name="allowIndexing" label="Let search engines list my public profile" help="Only applies when your profile is public. Off by default." defaultChecked={profile.allowIndexing} />
            </AdminForm>
          </Panel>

          <Panel title="Your data">
            <DataControls handle={profile.handle} />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <ProfileCard profile={profile} level={record.level.level} />
          {profile.visibility === 'PUBLIC' && (
            <Link href={`/builders/${profile.handle}`} className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
              View your public profile
            </Link>
          )}
          <Panel title="Customise" className="scroll-mt-20">
            <div id="customise" className="flex flex-col gap-6">
              {CUSTOM.map(({ kind, field, title }) => {
                const keys = ownedKeys(kind, owned);
                const options = OPTIONS[kind].filter((o) => keys.has(o.key));
                const locked = OPTIONS[kind].length - options.length;
                return (
                  <div key={kind}>
                    <p className="type-label text-text-muted">{title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {kind === 'TITLE' && (
                        <form action={applyCustomisation.bind(null, kind, '')}>
                          <button type="submit" aria-pressed={profile.titleKey === null} className={`min-h-10 rounded-full border px-3.5 text-sm font-medium ${profile.titleKey === null ? 'border-lime text-lime' : 'border-border-strong text-text-muted hover:text-white'}`}>
                            None
                          </button>
                        </form>
                      )}
                      {options.map((option) => {
                        const on = profile[field] === option.key;
                        return (
                          <form key={option.key} action={applyCustomisation.bind(null, kind, option.key)}>
                            <button type="submit" aria-pressed={on} className={`min-h-10 rounded-full border px-3.5 text-sm font-medium ${on ? 'border-lime text-lime' : 'border-border-strong text-text-muted hover:text-white'}`}>
                              {option.label}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                    {locked > 0 && (
                      <p className="mt-2 text-xs text-text-muted">
                        {locked} more in{' '}
                        <Link href="/builder/rewards" className="underline underline-offset-4">
                          rewards
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
