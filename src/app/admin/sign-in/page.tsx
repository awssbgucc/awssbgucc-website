import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleSignIn } from '@/components/admin/GoogleSignIn';
import { NO_ACCESS_MESSAGE } from '@/lib/auth-rules';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ error?: string }> };

// The official chip from the brand kit, used here instead of the pixel trace (W7 in tasks/todo.md).
export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p role="alert" className="font-medium">
            {NO_ACCESS_MESSAGE}
          </p>
          <Link href="/builder" className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline underline-offset-4 hover:text-white">
            Go to the builder portal
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <Image src="/brand/sbg-chip-purple.svg" alt="" width={64} height={64} unoptimized />
          <h1 className="type-section">Sign in</h1>
          <GoogleSignIn />
        </div>
      )}
    </main>
  );
}
