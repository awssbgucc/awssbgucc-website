'use client';

import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';

type GoogleSignInProps = { callbackURL?: string; errorCallbackURL?: string; label?: string };

export function GoogleSignIn({ callbackURL = '/admin', errorCallbackURL = '/admin/sign-in', label = 'Sign in with Google' }: GoogleSignInProps) {
  return <Button onClick={() => authClient.signIn.social({ provider: 'google', callbackURL, errorCallbackURL })}>{label}</Button>;
}
