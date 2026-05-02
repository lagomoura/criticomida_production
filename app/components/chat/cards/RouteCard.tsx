'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCopy,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import { CreateRouteResult } from '@/app/lib/api/chat';
import { cn } from '@/app/lib/utils/cn';

interface RouteCardProps {
  result: CreateRouteResult;
}

/**
 * Card rendered when the bot calls ``create_dish_route``. Shows the
 * route name + dish count + a deeplink to the public page (when the
 * list is public) and a copy-link button so the user can share it
 * without leaving the chat.
 */
export default function RouteCard({ result }: RouteCardProps) {
  const t = useTranslations('chat.routeCard');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const href = result.is_public ? `/${locale}/listas/${result.slug}` : null;

  async function handleCopy() {
    if (!href) return;
    try {
      const fullUrl = `${window.location.origin}${href}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API blocked: silent fail, user can still click the link */
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-action-primary/5 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-action-primary text-text-inverse">
          <FontAwesomeIcon icon={faRoute} aria-hidden className="h-4 w-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs uppercase tracking-wide text-action-primary">
            {t('label')}
          </span>
          <span className="font-display text-base font-medium text-text-primary">
            {result.name}
          </span>
          <span className="text-xs text-text-muted">
            {t('dishCount', { count: result.dish_count })}
            {result.is_public ? '' : ` · ${t('private')}`}
          </span>
        </div>
      </div>

      {result.description && (
        <p className="text-sm leading-relaxed text-text-primary">
          {result.description}
        </p>
      )}

      {href && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-action-primary px-3 py-1.5 text-xs font-medium text-text-inverse',
              'transition-colors hover:bg-action-primary-hover',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            )}
          >
            {t('open')}
          </Link>
          <button
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3 py-1.5 text-xs font-medium text-text-primary',
              'transition-colors hover:bg-surface-subtle',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            )}
          >
            <FontAwesomeIcon
              icon={copied ? faCheck : faCopy}
              aria-hidden
              className="h-3 w-3"
            />
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      )}
    </article>
  );
}
