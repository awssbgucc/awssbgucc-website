'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import type { FormState } from '@/lib/admin/forms';
import { INTERESTS, LEVELS_OF_STUDY } from '@/lib/platform/customise';
import { completeOnboarding } from '../actions/profile';

const STEPS = [
  { title: 'About you', why: 'Your name and programme help the team plan sessions for the people who come.' },
  { title: 'What you want to build', why: 'Interests decide which challenges and materials we put in front of you. Links are optional.' },
  { title: 'Privacy', why: 'You choose who sees your profile. Nothing about you is public unless you say so.' },
];

// The step each field lives on, so a server error opens the right step.
const FIELD_STEP: Record<string, number> = { displayName: 0, handle: 0, programme: 0, level: 0, department: 0, bio: 1, githubUrl: 1, linkedinUrl: 1, visibility: 2, referralCode: 2, acceptPrivacy: 2 };

const INPUT = 'w-full min-h-11 rounded-sm border border-border-strong bg-bg px-3 py-2 text-base text-text aria-[invalid=true]:border-danger';

function Field({ id, label, help, error, children }: { id: string; label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {help && (
        <p id={`${id}-help`} className="mt-1.5 text-sm text-text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Setting up' : 'Finish and open the portal'}
    </Button>
  );
}

export function WelcomeForm({ name, handle, email }: { name: string; handle: string; email: string }) {
  const [state, action] = useActionState<FormState, FormData>(completeOnboarding, {});
  const [step, setStep] = useState(0);
  const fieldsets = useRef<(HTMLFieldSetElement | null)[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const v = (key: string, fallback = '') => state.values?.[key] ?? fallback;
  const err = (key: string) => state.errors?.[key];
  const picked = (state.values?.interests ?? '').split('|');
  const describe = (key: string, help = false) => [help && `${key}-help`, err(key) && `${key}-error`].filter(Boolean).join(' ') || undefined;

  useEffect(() => {
    const first = Object.keys(state.errors ?? {})[0];
    if (first !== undefined) setStep(FIELD_STEP[first] ?? 0);
  }, [state]);

  useEffect(() => heading.current?.focus(), [step]);

  function next() {
    const current = fieldsets.current[step];
    if (current && ![...current.querySelectorAll('input, select, textarea')].every((el) => (el as HTMLInputElement).reportValidity())) return;
    setStep(Math.min(step + 1, STEPS.length - 1));
  }

  return (
    <div className="mx-auto grid min-h-dvh max-w-[1100px] lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-border px-6 py-8 lg:border-r lg:border-b-0 lg:py-16">
        <p className="type-label text-lime">Builder portal</p>
        <p className="mt-3 text-sm text-text-muted">Signed in as {email}</p>
        <ol className="mt-8 hidden flex-col gap-6 lg:flex">
          {STEPS.map((s, index) => (
            <li key={s.title} aria-current={index === step ? 'step' : undefined} className={`border-l-2 pl-4 ${index === step ? 'border-lime' : index < step ? 'border-border-strong' : 'border-border'}`}>
              <p className={`type-label ${index === step ? 'text-lime' : 'text-text-muted'}`}>Step {index + 1}</p>
              <p className={`mt-1 font-semibold ${index === step ? 'text-white' : 'text-text-muted'}`}>{s.title}</p>
              {index === step && <p className="mt-2 text-sm text-text-muted">{s.why}</p>}
            </li>
          ))}
        </ol>
        <p className="type-label mt-6 text-text-muted lg:hidden">
          Step {step + 1} of {STEPS.length}
        </p>
      </aside>

      {/* The key remounts the fields with what was typed after a failed save. */}
      <form key={JSON.stringify(state.values ?? {})} action={action} className="px-6 py-8 lg:px-16 lg:py-16">
        <h1 ref={heading} tabIndex={-1} className="type-section outline-none">
          {STEPS[step].title}
        </h1>
        <p className="mt-3 max-w-[56ch] text-text-muted lg:hidden">{STEPS[step].why}</p>

        <fieldset ref={(el) => { fieldsets.current[0] = el; }} hidden={step !== 0} className="mt-8 flex max-w-[560px] flex-col gap-6">
          <legend className="sr-only">About you</legend>
          <Field id="displayName" label="Your name" error={err('displayName')}>
            <input id="displayName" name="displayName" required maxLength={60} defaultValue={v('displayName', name)} autoComplete="name" aria-invalid={!!err('displayName')} aria-describedby={describe('displayName')} className={INPUT} />
          </Field>
          <Field id="handle" label="Handle" help="Your profile address. Lowercase letters, numbers and hyphens." error={err('handle')}>
            <input id="handle" name="handle" required minLength={3} maxLength={30} pattern="[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]" defaultValue={v('handle', handle)} aria-invalid={!!err('handle')} aria-describedby={describe('handle', true)} className={`${INPUT} font-display`} />
          </Field>
          <Field id="programme" label="Programme" help="For example, BSc Computer Science. Optional." error={err('programme')}>
            <input id="programme" name="programme" maxLength={80} defaultValue={v('programme')} aria-describedby={describe('programme', true)} className={INPUT} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="level" label="Level" error={err('level')}>
              <select id="level" name="level" defaultValue={v('level')} className={INPUT}>
                <option value="">Prefer not to say</option>
                {LEVELS_OF_STUDY.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </Field>
            <Field id="department" label="Department" error={err('department')}>
              <input id="department" name="department" maxLength={80} defaultValue={v('department')} className={INPUT} />
            </Field>
          </div>
        </fieldset>

        <fieldset ref={(el) => { fieldsets.current[1] = el; }} hidden={step !== 1} className="mt-8 flex max-w-[640px] flex-col gap-6">
          <legend className="sr-only">What you want to build</legend>
          <div role="group" aria-labelledby="interests-label">
            <p id="interests-label" className="mb-3 text-sm font-medium">
              Interests <span className="text-text-muted">(up to six)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <label key={interest} className="cursor-pointer">
                  <input type="checkbox" name="interests" value={interest} defaultChecked={picked.includes(interest)} className="peer sr-only" />
                  <span className="inline-flex min-h-10 items-center rounded-full border border-border-strong px-3.5 text-sm font-medium text-text-muted transition-colors duration-150 ease-brand peer-checked:border-lime peer-checked:bg-lime/8 peer-checked:text-lime peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan hover:text-white">
                    {interest}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Field id="bio" label="A line about you" help="Optional. 280 characters at most." error={err('bio')}>
            <textarea id="bio" name="bio" rows={3} maxLength={280} defaultValue={v('bio')} aria-describedby={describe('bio', true)} className={INPUT} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="githubUrl" label="GitHub" help="Optional." error={err('githubUrl')}>
              <input id="githubUrl" name="githubUrl" type="url" inputMode="url" placeholder="https://github.com/your-name" defaultValue={v('githubUrl')} aria-invalid={!!err('githubUrl')} aria-describedby={describe('githubUrl', true)} className={INPUT} />
            </Field>
            <Field id="linkedinUrl" label="LinkedIn" help="Optional." error={err('linkedinUrl')}>
              <input id="linkedinUrl" name="linkedinUrl" type="url" inputMode="url" placeholder="https://www.linkedin.com/in/your-name" defaultValue={v('linkedinUrl')} aria-invalid={!!err('linkedinUrl')} aria-describedby={describe('linkedinUrl', true)} className={INPUT} />
            </Field>
          </div>
        </fieldset>

        <fieldset ref={(el) => { fieldsets.current[2] = el; }} hidden={step !== 2} className="mt-8 flex max-w-[640px] flex-col gap-6">
          <legend className="sr-only">Privacy</legend>
          <div role="radiogroup" aria-labelledby="visibility-label">
            <p id="visibility-label" className="mb-3 text-sm font-medium">
              Who can see your profile
            </p>
            {[
              ['PRIVATE', 'Only me and the core team', 'The default. You still get a full record.'],
              ['MEMBERS', 'Signed-in members', 'Appear in the member directory, by name and interests.'],
              ['PUBLIC', 'Anyone', 'A public profile page with your approved projects and achievements.'],
            ].map(([value, label, help]) => (
              <label key={value} className="flex cursor-pointer gap-3 border-b border-border py-3">
                <input type="radio" name="visibility" value={value} defaultChecked={v('visibility', 'PRIVATE') === value} className="mt-1 size-4 accent-white" />
                <span>
                  <span className="block font-medium text-white">{label}</span>
                  <span className="block text-sm text-text-muted">{help}</span>
                </span>
              </label>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="showOnLeaderboards" defaultChecked={v('showOnLeaderboards') === 'on'} className="size-5 accent-white" />
            Show my name on challenge leaderboards
          </label>
          <Field id="referralCode" label="Referral code" help="Optional. If a member invited you, enter their code. They are credited when you attend your first session." error={err('referralCode')}>
            <input id="referralCode" name="referralCode" maxLength={20} defaultValue={v('referralCode')} aria-invalid={!!err('referralCode')} aria-describedby={describe('referralCode', true)} className={`${INPUT} font-display uppercase`} />
          </Field>
          <div>
            <label className="flex items-start gap-3 text-sm font-medium">
              <input type="checkbox" name="acceptPrivacy" required className="mt-0.5 size-5 shrink-0 accent-white" aria-invalid={!!err('acceptPrivacy')} aria-describedby={err('acceptPrivacy') ? 'acceptPrivacy-error' : undefined} />
              <span>
                I have read the{' '}
                <Link href="/privacy" target="_blank" className="underline underline-offset-4">
                  privacy notice
                </Link>{' '}
                and agree to the{' '}
                <Link href="/code-of-conduct" target="_blank" className="underline underline-offset-4">
                  code of conduct
                </Link>
                .
              </span>
            </label>
            {err('acceptPrivacy') && (
              <p id="acceptPrivacy-error" className="mt-1.5 text-sm font-medium text-danger">
                {err('acceptPrivacy')}
              </p>
            )}
          </div>
        </fieldset>

        {state.message && (
          <p role="alert" className="mt-6 text-sm font-medium text-danger">
            {state.message}
          </p>
        )}
        {state.errors && (
          <p role="alert" className="mt-6 text-sm font-medium text-danger">
            Check the highlighted field.
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? <Button onClick={next}>Continue</Button> : <Submit />}
        </div>
      </form>
    </div>
  );
}
