import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleSignIn } from '@/components/admin/GoogleSignIn';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { NO_ACCESS_MESSAGE } from '@/lib/auth-rules';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ error?: string }> };

// The official chip from the brand kit, used here instead of the pixel trace (W7 in tasks/todo.md).
export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-bg-alt p-6">
      <ThemeSelector className="absolute top-4 right-4" />
      <div className="w-full max-w-sm rounded-lg border border-border-strong bg-card p-8 text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <Image src="/brand/sbg-chip-purple.svg" alt="" width={48} height={48} unoptimized />
            <p role="alert" className="text-sm font-medium text-danger">
              {NO_ACCESS_MESSAGE}
            </p>
            <Link href="/builder" className="inline-flex min-h-10 items-center text-sm font-medium text-text-muted underline underline-offset-4 hover:text-text-strong">
              Go to the Builder Portal
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Image src="/brand/sbg-chip-purple.svg" alt="" width={52} height={52} unoptimized />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-strong">Sign in</h1>
              <p className="mt-1 text-sm text-text-muted">Core team dashboard for AWS SBG UCC.</p>
            </div>
            <div className="pt-2">
              <GoogleSignIn />
            </div>
            <Link href="/" className="text-xs text-text-muted underline underline-offset-4 hover:text-text-strong">
              Back to public site
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
