'use client';

import { Link } from '@/app/lib/i18n/navigation';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/lib/hooks/useAuth';
import EditProfileForm from '@/app/[locale]/profile/components/EditProfileForm';
import ThemeToggle from '@/app/components/ThemeToggle';
import Button from '@/app/components/ui/Button';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('settings');
  const [loggingOut, setLoggingOut] = useState(false);

  const roleLabels: Record<string, string> = {
    admin: t('roleAdmin'),
    critic: t('roleCritic'),
    user: t('roleUser'),
  };

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      setLoggingOut(false);
    }
  }

  if (authLoading) {
    return (
      <main id="main-content" className="cc-container py-16 flex justify-center">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--mainPink)] border-t-transparent" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main id="main-content" className="cc-container py-12 md:py-16">
        <h1 className="mb-3 text-2xl font-bold text-neutral-900 md:text-3xl">{t('title')}</h1>
        <p className="mb-6 max-w-xl text-neutral-600">
          {t('anonMessage')}
        </p>
        <Link href="/" className="btn btn-primary">
          {t('goHome')}
        </Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="cc-container py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mainPink)] text-2xl font-bold text-white">
          {user!.display_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">{t('title')}</h1>
            <span className="rounded-full bg-[var(--mainPink)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--mainPink)]">
              {roleLabels[user!.role] ?? user!.role}
            </span>
          </div>
          <p className="text-sm text-neutral-500">{user!.email}</p>
        </div>
      </div>

      <EditProfileForm />

      <Link
        href="/saved"
        className="mb-6 flex items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3 no-underline transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">{t('savedTitle')}</p>
          <p className="font-sans text-xs text-text-muted">
            {t('savedDescription')}
          </p>
        </div>
        <span className="font-sans text-sm text-action-primary">{t('savedAction')}</span>
      </Link>

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3">
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">{t('themeTitle')}</p>
          <p className="font-sans text-xs text-text-muted">{t('themeDescription')}</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3">
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">{t('logoutTitle')}</p>
          <p className="font-sans text-xs text-text-muted">
            {t('logoutDescription')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={loggingOut}
          onClick={handleLogout}
          leftIcon={
            <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" aria-hidden />
          }
        >
          {t('logout')}
        </Button>
      </div>
    </main>
  );
}
