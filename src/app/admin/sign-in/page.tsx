import type { Metadata } from 'next';
import { GoogleSignIn } from '@/components/admin/GoogleSignIn';
import { NO_ACCESS_MESSAGE } from '@/lib/auth-rules';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ error?: string }> };

// TODO(joel): the pixel chip goes above the headline once the program contact confirms the logo trace is allowed.
export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      {error ? (
        <p role="alert" className="font-medium">
          {NO_ACCESS_MESSAGE}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="type-section">Sign in</h1>
          <GoogleSignIn />
        </div>
      )}
    </main>
  );
}
