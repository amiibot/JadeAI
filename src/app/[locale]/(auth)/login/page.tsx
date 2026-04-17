import { Suspense } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LoginButton } from '@/components/auth/login-button';

export default function LoginPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-6">
        <Image
          src="/logo-icon.svg"
          alt="JadeAI"
          width={48}
          height={48}
          className="drop-shadow-sm"
        />
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {t('welcomeBack')}
      </h1>
      <p className="mt-1.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t('loginDescription')}
      </p>

      <div className="mt-6 w-full">
        <Suspense fallback={null}>
          <LoginButton />
        </Suspense>
      </div>
    </div>
  );
}
