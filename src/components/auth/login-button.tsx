'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export function LoginButton() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/dashboard`;
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await signIn(username.trim(), password, callbackUrl);

    if (!result || result.error) {
      setError(t('invalidCredentials'));
      setIsSubmitting(false);
      return;
    }

    router.replace(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('username')}
        </label>
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder={t('usernamePlaceholder')}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('password')}
        </label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder={t('passwordPlaceholder')}
          className="h-11"
        />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button
        type="submit"
        disabled={isSubmitting || !username.trim() || !password}
        className="h-11 w-full cursor-pointer rounded-xl bg-brand px-6 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover"
      >
        {isSubmitting ? t('loggingIn') : t('login')}
      </Button>
    </form>
  );
}
