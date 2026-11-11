import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/member';
import { suggestHandle } from '@/lib/platform/rules';
import { WelcomeForm } from './WelcomeForm';

export const metadata: Metadata = { title: 'Set up your profile' };

export default async function WelcomePage() {
  const { user, profile } = await requireUser();
  if (profile?.onboardedAt) redirect('/builder');
  return (
    <main className="min-h-dvh bg-bg">
      <WelcomeForm name={user.name} handle={suggestHandle(user.name || user.email.split('@')[0])} email={user.email} />
    </main>
  );
}
