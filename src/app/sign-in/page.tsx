import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { GoogleSignIn } from '@/components/admin/GoogleSignIn';
import { BrandMark } from '@/components/ui/BrandMark';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { signInMessage } from '@/lib/auth-rules';
import { sessionUser } from '@/lib/member';

export const metadata: Metadata = { title: 'Sign in to the Builder Portal', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ error?: string }> };

const WHAT_YOU_DO = [
  ['Check in', 'Enter the session code shown in the room to log your attendance.'],
  ['Access materials', 'Find slides, repositories and lab guides from each session.'],
  ['Submit challenges', 'Complete post-session challenges and get feedback from the technical team.'],
  ['Share projects', 'Submit your AWS projects to feature them on the public projects page.'],
];

export default async function MemberSignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  if (!error && (await sessionUser())) redirect('/builder');
  const message = signInMessage(error);

  return (
    <main className="min-h-dvh bg-bg">
      <div className="mx-auto grid min-h-dvh max-w-[1200px] lg:grid-cols-[1.1fr_1fr]">
        <section className="hero-grid flex flex-col justify-between gap-12 border-b border-border px-6 py-10 lg:border-r lg:border-b-0 lg:px-12 lg:py-16">
          <BrandMark href="/" label="University of Cape Coast" />
          <div>
            <p className="type-label text-lime">Builder Portal</p>
            <h1 className="type-hero mt-4 max-w-[12ch]">Track your sessions and projects.</h1>
            {/* Hidden on phones, so the sign-in button and any error message are on the first screen. */}
            <ul className="mt-10 hidden gap-6 sm:grid sm:grid-cols-2">
              {WHAT_YOU_DO.map(([title, copy]) => (
                <li key={title} className="border-t border-border pt-4">
                  <p className="font-semibold text-text-strong">{title}</p>
                  <p className="mt-1 text-sm text-text-muted">{copy}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-text-muted">Event RSVPs still happen on Meetup. The Builder Portal tracks your attendance, materials, challenges and projects.</p>
        </section>
        <section className="relative flex items-center px-6 py-12 lg:px-12">
          {/* In the corner of the sign-in column, so nothing that was already on the page moves. */}
          <ThemeSelector className="absolute top-3 right-6 lg:right-12" />
          <div className="w-full max-w-sm">
            <h2 className="type-section">Sign in</h2>
            <p className="mt-3 text-text-muted">Use your Google account. New here? Signing in creates your account, and you will set up your profile on the next screen.</p>
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
