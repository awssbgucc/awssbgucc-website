'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

type GoogleSignInProps = { callbackURL?: string; errorCallbackURL?: string; label?: string };

/**
 * The button stays locked from the click until the browser leaves for Google, so it visibly registered.
 * If the request to start sign-in fails, it says so instead of doing nothing.
 */
export function GoogleSignIn({ callbackURL = '/admin', errorCallbackURL = '/admin/sign-in', label = 'Sign in with Google' }: GoogleSignInProps) {
  const [state, setState] = useState<'idle' | 'starting' | 'failed'>('idle');

  async function start() {
    setState('starting');
    try {
      const { error } = await authClient.signIn.social({ provider: 'google', callbackURL, errorCallbackURL });
      if (error) setState('failed');
    } catch {
      setState('failed');
    }
  }

  return (
    <>
      <Button onClick={start} disabled={state === 'starting'} className="disabled:opacity-60">
        {state === 'starting' ? 'Opening Google' : label}
      </Button>
      {state === 'failed' && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          Sign in could not start. Check your connection and try again.
        </p>
      )}
    </>
  );
}
