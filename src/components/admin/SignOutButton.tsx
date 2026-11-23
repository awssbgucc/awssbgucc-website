'use client';

import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function SignOutButton({ to = '/admin/sign-in', className = '' }: { to?: string; className?: string }) {
  async function signOut() {
    await authClient.signOut();
    window.location.href = to;
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className={`inline-flex min-h-9 w-full items-center gap-2 rounded-md border border-border-strong bg-card px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-text-muted hover:bg-card-raised hover:text-text-strong ${className}`}
    >
      <LogOut aria-hidden size={14} />
      <span>Sign out</span>
    </button>
  );
}
