import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { GoogleSignIn } from '@/components/admin/GoogleSignIn';
import { BrandMark } from '@/components/ui/BrandMark';
import { SIGN_IN_ERRORS, type SignInError } from '@/lib/auth-rules';
import { sessionUser } from '@/lib/member';

export const metadata: Metadata = { title: 'Sign in to the builder portal', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ error?: string }> };

const WHAT_YOU_DO = [
  ['Check in', 'Enter the code shown in the room, and the session goes on your record.'],
  ['Get the materials', 'Slides, repositories and lab guides from each session.'],
  ['Build and submit', 'Take on challenges and get feedback from the technical team.'],
  ['Ship projects', 'Approved projects appear on the public showcase, with your consent.'],
];

export default async function MemberSignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  if (!error && (await sessionUser())) redirect('/builder');
  const message = error ? (SIGN_IN_ERRORS[error as SignInError] ?? 'Sign in did not work. Try again.') : null;

  return (
    <main className="min-h-dvh bg-bg">
      <div className="mx-auto grid min-h-dvh max-w-[1200px] lg:grid-cols-[1.1fr_1fr]">
        <section className="hero-grid flex flex-col justify-between gap-12 border-b border-border px-6 py-10 lg:border-r lg:border-b-0 lg:px-12 lg:py-16">
          <BrandMark href="/" label="University of Cape Coast" />
          <div>
            <p className="type-label text-lime">Builder Portal</p>
            <h1 className="type-hero mt-4 max-w-[12ch]">Your record of building.</h1>
            {/* Hidden on phones, so the sign-in button and any error message are on the first screen. */}
            <ul className="mt-10 hidden gap-6 sm:grid sm:grid-cols-2">
              {WHAT_YOU_DO.map(([title, copy]) => (
                <li key={title} className="border-t border-border pt-4">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-text-muted">{copy}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-text-muted">RSVPs stay on Meetup. The portal records what you do at and after each session.</p>
        </section>
        <section className="flex items-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-sm">
            <h2 className="type-section">Sign in</h2>
            <p className="mt-3 text-text-muted">Use your Google account. New here? Signing in creates your member account, and the next screen sets up your profile.</p>
            {message && (
              <p role="alert" className="mt-6 rounded-sm border border-danger/40 bg-danger/8 px-4 py-3 text-sm font-medium text-danger">
                {message}
              </p>
            )}
            <div className="mt-8">
              <GoogleSignIn callbackURL="/builder" errorCallbackURL="/sign-in" label="Continue with Google" />
            </div>
            <p className="mt-8 text-sm text-text-muted">
              We store your name, email and the profile you fill in. Read the{' '}
              <Link href="/privacy" className="underline underline-offset-4">
                privacy notice
              </Link>
              .
            </p>
            <p className="mt-4 text-sm text-text-muted">
              Core team?{' '}
              <Link href="/admin/sign-in" className="underline underline-offset-4">
                Dashboard sign-in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
