'use client';

import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  async function signOut() {
    await authClient.signOut();
    window.location.href = '/admin/sign-in';
  }
  return (
    <button type="button" onClick={signOut} className="min-h-11 text-sm font-medium text-text-muted underline underline-offset-4 hover:text-white">
      Sign out
    </button>
  );
}
