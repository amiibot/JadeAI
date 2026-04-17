'use client';

import { useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const session = useSession();

  const handleSignIn = useCallback((username: string, password: string, callbackUrl?: string) => {
    return signIn('credentials', {
      username,
      password,
      callbackUrl,
      redirect: false,
    });
  }, []);

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
    signOut: () => signOut(),
  };
}
