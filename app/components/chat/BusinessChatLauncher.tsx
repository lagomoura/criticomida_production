'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faComments } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/app/lib/utils/cn';
import ChatDrawer from './ChatDrawer';

interface BusinessChatLauncherProps {
  restaurantScopeId: string;
  restaurantName: string;
}

/**
 * Inline launcher for the Business agent. Lives inside the owner
 * dashboard — a separate entry-point from the global Sommelier
 * floating button so the owner sees clearly that this is the
 * analytics chat scoped to their restaurant.
 */
export default function BusinessChatLauncher({
  restaurantScopeId,
  restaurantName,
}: BusinessChatLauncherProps) {
  const t = useTranslations('ownerDashboard.businessChat');
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-action-primary/5 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-action-primary text-text-inverse">
          <FontAwesomeIcon
            icon={faChartLine}
            aria-hidden
            className="h-4 w-4"
          />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-action-primary">
            {t('badge')}
          </span>
          <h3 className="font-display text-lg font-medium text-text-primary">
            {t('title')}
          </h3>
          <p className="text-sm text-text-muted">{t('subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-action-primary px-4 py-2 text-sm font-semibold text-text-inverse',
            'transition-colors hover:bg-action-primary-hover',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          )}
        >
          <FontAwesomeIcon
            icon={faComments}
            aria-hidden
            className="h-3.5 w-3.5"
          />
          {t('open')}
        </button>
      </div>

      <ul className="ml-5 list-disc text-sm text-text-muted">
        <li>{t('exampleDrop', { restaurant: restaurantName })}</li>
        <li>{t('exampleBenchmark')}</li>
        <li>{t('examplePending')}</li>
      </ul>

      <ChatDrawer
        open={open}
        onClose={() => setOpen(false)}
        agent="business"
        restaurantScopeId={restaurantScopeId}
      />
    </section>
  );
}
