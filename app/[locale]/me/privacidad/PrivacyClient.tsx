'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import EmptyState from '@/app/components/ui/EmptyState';
import Tabs from '@/app/components/ui/Tabs';
import { useToast } from '@/app/components/ui/Toast';
import { SettingsSkeleton } from '@/app/components/ui/SkeletonPresets';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { ApiError } from '@/app/lib/api/client';
import {
  listBlockedUsers,
  listMutedUsers,
  unblockUser,
  unmuteUser,
  type SafetyUser,
} from '@/app/lib/api/safety';

type TabKind = 'blocked' | 'muted';

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      items: SafetyUser[];
      nextCursor: string | null;
      loadingMore: boolean;
    };

const INITIAL: ListState = { status: 'loading' };

export default function PrivacyClient() {
  const t = useTranslations('privacy');
  const locale = useLocale();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKind>('blocked');
  const [blocked, setBlocked] = useState<ListState>(INITIAL);
  const [muted, setMuted] = useState<ListState>(INITIAL);
  // Track which row is in flight so we disable just that button (not the
  // whole list) and don't accept double-clicks.
  const [pendingId, setPendingId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const loadList = useCallback(
    async (kind: TabKind, cursor: string | null = null) => {
      const setter = kind === 'blocked' ? setBlocked : setMuted;
      const fetcher = kind === 'blocked' ? listBlockedUsers : listMutedUsers;
      // Initial load and "load more" share the function; differentiate by
      // whether we've already got items.
      if (cursor === null) {
        setter({ status: 'loading' });
      } else {
        setter((prev) =>
          prev.status === 'ready'
            ? { ...prev, loadingMore: true }
            : prev,
        );
      }
      try {
        const page = await fetcher(cursor, 20);
        setter((prev) => {
          const existing =
            prev.status === 'ready' && cursor !== null ? prev.items : [];
          return {
            status: 'ready',
            items: [...existing, ...page.items],
            nextCursor: page.nextCursor,
            loadingMore: false,
          };
        });
      } catch {
        setter({ status: 'error', message: t('loadErrorTitle') });
      }
    },
    [t],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadList('blocked');
    void loadList('muted');
  }, [isAuthenticated, loadList]);

  async function handleUnblock(user: SafetyUser) {
    setPendingId(user.id);
    try {
      await unblockUser(user.id);
      setBlocked((prev) =>
        prev.status === 'ready'
          ? { ...prev, items: prev.items.filter((u) => u.id !== user.id) }
          : prev,
      );
      toast.toast({
        title: t('unblockedToast', { name: nameLabel(user) }),
        variant: 'success',
      });
    } catch (err) {
      toast.toast({
        title: t('errorTitle'),
        description:
          err instanceof ApiError && err.detail
            ? err.detail
            : t('errorGeneric'),
        variant: 'error',
      });
    } finally {
      setPendingId(null);
    }
  }

  async function handleUnmute(user: SafetyUser) {
    setPendingId(user.id);
    try {
      await unmuteUser(user.id);
      setMuted((prev) =>
        prev.status === 'ready'
          ? { ...prev, items: prev.items.filter((u) => u.id !== user.id) }
          : prev,
      );
      toast.toast({
        title: t('unmutedToast', { name: nameLabel(user) }),
        variant: 'success',
      });
    } catch (err) {
      toast.toast({
        title: t('errorTitle'),
        description:
          err instanceof ApiError && err.detail
            ? err.detail
            : t('errorGeneric'),
        variant: 'error',
      });
    } finally {
      setPendingId(null);
    }
  }

  function nameLabel(u: SafetyUser): string {
    return u.handle ? `@${u.handle}` : u.displayName;
  }

  if (authLoading) return <SettingsSkeleton />;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-medium text-text-primary">
          {t('heading')}
        </h1>
        <p className="max-w-xl text-text-muted">{t('anonDescription')}</p>
        <Link href="/login" className="btn btn-primary">
          {t('anonTitle')}
        </Link>
      </div>
    );
  }

  const counts = {
    blocked:
      blocked.status === 'ready' ? blocked.items.length : undefined,
    muted: muted.status === 'ready' ? muted.items.length : undefined,
  };

  const activeState = activeTab === 'blocked' ? blocked : muted;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-medium text-text-primary">
          {t('heading')}
        </h1>
        <p className="max-w-2xl font-sans text-text-secondary">{t('subtitle')}</p>
      </header>

      <Tabs
        ariaLabel={t('heading')}
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabKind)}
        items={[
          { value: 'blocked', label: t('tabBlocked'), count: counts.blocked },
          { value: 'muted', label: t('tabMuted'), count: counts.muted },
        ]}
      />

      <section className="flex flex-col gap-3" aria-live="polite">
        {activeState.status === 'loading' && (
          <p className="font-sans text-sm text-text-muted">{t('loading')}</p>
        )}

        {activeState.status === 'error' && (
          <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="mb-2 h-6 w-6 text-action-danger"
              aria-hidden
            />
            <p className="mb-3 font-sans text-sm text-text-primary">
              {activeState.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadList(activeTab)}
            >
              {t('loadErrorAction')}
            </Button>
          </div>
        )}

        {activeState.status === 'ready' && activeState.items.length === 0 && (
          <EmptyState
            title={
              activeTab === 'blocked'
                ? t('emptyBlockedTitle')
                : t('emptyMutedTitle')
            }
            description={
              activeTab === 'blocked'
                ? t('emptyBlockedDescription')
                : t('emptyMutedDescription')
            }
          />
        )}

        {activeState.status === 'ready' && activeState.items.length > 0 && (
          <ul className="flex flex-col gap-2" role="list">
            {activeState.items.map((u) => {
              const isPending = pendingId === u.id;
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-surface-card p-3"
                >
                  <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-medium text-text-primary">
                      {u.displayName}
                    </p>
                    <p className="truncate font-sans text-xs text-text-muted">
                      {u.handle ? `@${u.handle} · ` : ''}
                      {t('rowSince', {
                        date: dateFormatter.format(new Date(u.createdAt)),
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void (activeTab === 'blocked'
                        ? handleUnblock(u)
                        : handleUnmute(u))
                    }
                    loading={isPending}
                    disabled={pendingId !== null && !isPending}
                  >
                    {activeTab === 'blocked'
                      ? isPending
                        ? t('unblocking')
                        : t('unblock')
                      : isPending
                        ? t('unmuting')
                        : t('unmute')}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        {activeState.status === 'ready' && activeState.nextCursor && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              loading={activeState.loadingMore}
              onClick={() => void loadList(activeTab, activeState.nextCursor)}
            >
              {t('loadMore')}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
