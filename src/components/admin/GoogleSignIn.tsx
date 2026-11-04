'use client';

import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

export function GoogleSignIn() {
  return (
    <Button
      onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/admin', errorCallbackURL: '/admin/sign-in' })}
    >
      Sign in with Google
    </Button>
  );
}
