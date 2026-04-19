'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useSession, signIn, signOut } from 'next-auth/react';
import { buildLocalizedDashboardPath, buildLocalizedLoginPath, sanitizeRelativeCallbackPath } from '@/lib/utils/url';

export function useAuth() {
  const locale = useLocale();
  const session = useSession();

  const handleSignIn = useCallback((username: string, password: string, callbackUrl?: string) => {
    return signIn('credentials', {
      username,
      password,
      redirectTo: sanitizeRelativeCallbackPath(callbackUrl, buildLocalizedDashboardPath(locale)),
      redirect: false,
    });
  }, [locale]);

  const handleSignOut = useCallback(() => {
    const loginPath = buildLocalizedLoginPath(locale);
    const redirectTo = typeof window === 'undefined'
      ? loginPath
      : new URL(loginPath, window.location.origin).toString();

    return signOut({ redirectTo });
  }, [locale]);

  return {
    user: session.data?.user
      ? {
          id: session.data.user.id || '',
          name: session.data.user.name,
          email: session.data.user.email,
          avatarUrl: session.data.user.image,
          username: session.data.user.username,
          authType: 'local' as const,
        }
      : null,
    isLoading: session.status === 'loading',
    isAuthenticated: session.status === 'authenticated',
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
