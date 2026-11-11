'use client';

import { authClient } from '@/lib/auth-client';

export function SignOutButton({ to = '/admin/sign-in', className = '' }: { to?: string; className?: string }) {
  async function signOut() {
    await authClient.signOut();
    window.location.href = to;
  }
  return (
    <button type="button" onClick={signOut} className={`min-h-11 text-sm font-medium text-text-muted underline underline-offset-4 hover:text-white ${className}`}>
      Sign out
    </button>
  );
}
