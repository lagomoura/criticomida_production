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
import Avatar from '@/app/components/ui/Avatar';
import { useToast } from '@/app/components/ui/Toast';
import { SettingsSkeleton } from '@/app/components/ui/SkeletonPresets';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('settings');
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

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
      setConfirmingLogout(false);
      toast.error(t('logoutError'));
    }
  }

  // Loading state — structured skeleton instead of spinner
  if (authLoading) {
    return <SettingsSkeleton />;
  }

  // Anon state — guide to sign in
  if (!isAuthenticated) {
    return (
      <main id="main-content" className="cc-container py-12 md:py-16">
        <h1 className="font-display mb-3 text-[clamp(2rem,5vw,3rem)] font-medium text-text-primary">
          {t('title')}
        </h1>
        <p className="mb-6 max-w-xl text-text-muted">
          {t('anonMessage')}
        </p>
        <Link href="/login" className="btn btn-primary">
          {t('goHome')}
        </Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="cc-container py-10 md:py-14">
      {/* User header — display only, cursor-default signals non-interactivity */}
      <div className="mb-8 flex flex-wrap items-center gap-4 cursor-default select-none">
        <Avatar
          name={user!.display_name}
          src={user!.avatar_url}
          size="lg"
          className="bg-action-primary/10 text-action-primary"
        />
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary md:text-3xl">
            {t('title')}
          </h1>
          <div className="mt-0.5 flex items-center gap-2">
            {/* User display name with Cormorant for editorial moment */}
            <span className="font-display text-xl italic text-text-primary">
              {user!.display_name}
            </span>
            <span className="rounded-full bg-action-primary/10 px-2.5 py-0.5 text-xs font-semibold text-action-primary">
              {roleLabels[user!.role] ?? user!.role}
            </span>
          </div>
          <p className="font-sans text-sm text-text-muted">{user!.email}</p>
        </div>
      </div>

      <EditProfileForm />

      {/* Saved reviews */}
      <Link
        href="/saved"
        className="mb-6 flex min-h-[44px] items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3 no-underline transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">{t('savedTitle')}</p>
          <p className="font-sans text-xs text-text-muted">
            {t('savedDescription')}
          </p>
        </div>
        <span className="font-sans text-sm text-action-primary">{t('savedAction')}</span>
      </Link>

      {/* Preferences / gustos */}
      <Link
        href="/me/preferencias"
        className="mb-6 flex min-h-[44px] items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3 no-underline transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">{t('preferencesTitle')}</p>
          <p className="font-sans text-xs text-text-muted">
            {t('preferencesDescription')}
          </p>
        </div>
        <span className="font-sans text-sm text-action-primary">{t('preferencesAction')}</span>
      </Link>

      {/* Theme toggle — pill variant */}
      <div className="mb-6 flex min-h-[44px] items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3">
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">{t('themeTitle')}</p>
          <p className="font-sans text-xs text-text-muted">{t('themeDescription')}</p>
        </div>
        <ThemeToggle variant="pill" />
      </div>

      {/* Logout — inline confirmation, no modal */}
      <div className="flex min-h-[44px] items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3">
        {confirmingLogout ? (
          /* Confirmation state */
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <p className="font-sans text-sm font-medium text-text-primary">
              {t('logoutConfirm')}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="ghost"
                size="md"
                disabled={loggingOut}
                onClick={() => setConfirmingLogout(false)}
              >
                {t('logoutCancel')}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={loggingOut}
                onClick={handleLogout}
                leftIcon={
                  <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" aria-hidden />
                }
              >
                {t('logoutConfirmAction')}
              </Button>
            </div>
          </div>
        ) : (
          /* Default state */
          <>
            <div>
              <p className="font-sans text-sm font-medium text-text-primary">{t('logoutTitle')}</p>
              <p className="font-sans text-xs text-text-muted">
                {t('logoutDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingLogout(true)}
              leftIcon={
                <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" aria-hidden />
              }
            >
              {t('logout')}
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
