import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import Avatar from '@/app/components/ui/Avatar';
import DiscoveryBadge from '@/app/components/ui/DiscoveryBadge';
import type { DishFirstDiscoverer } from '@/app/lib/types/social';

export interface FirstDiscoverersBlockProps {
  discoverers: DishFirstDiscoverer[];
  dishName: string;
}

export default function FirstDiscoverersBlock({
  discoverers,
  dishName,
}: FirstDiscoverersBlockProps) {
  const t = useTranslations('dish.discoverers');
  if (!discoverers || discoverers.length === 0) {
    return null;
  }

  const seenUsers = new Set<string>();
  const unique = discoverers.filter((d) => {
    if (seenUsers.has(d.userId)) return false;
    seenUsers.add(d.userId);
    return true;
  });

  return (
    <section
      aria-labelledby="discoverers-heading"
      className="rounded-2xl border border-[color:var(--color-azafran)]/30 bg-[color:var(--color-azafran-pale)]/40 p-5 sm:p-6"
    >
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-azafran)]">
          {t('kicker')}
        </p>
        <h2
          id="discoverers-heading"
          className="mt-1 font-display text-xl font-medium leading-tight text-text-primary sm:text-2xl"
        >
          {t('heading')}
        </h2>
        <p className="mt-1 font-sans text-sm text-text-secondary">
          {t('subtitle', { dish: dishName })}
        </p>
      </header>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {unique.map((d) => (
          <li key={d.reviewId} className="contents">
            <DiscovererCard discoverer={d} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function DiscovererCard({ discoverer }: { discoverer: DishFirstDiscoverer }) {
  const t = useTranslations('dish.discoverers');
  const locale = useLocale();
  const name = discoverer.displayName ?? '@' + (discoverer.handle ?? t('fallbackHandle'));
  const profileHref = discoverer.handle
    ? `/u/${discoverer.handle}`
    : `/u/${discoverer.userId}`;

  return (
    <Link
      href={profileHref}
      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card p-3 transition-shadow hover:shadow-[var(--shadow-base)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
    >
      <Avatar src={discoverer.avatarUrl} name={name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <DiscoveryBadge rank={discoverer.rank} variant="compact" />
        </div>
        <p className="mt-1 truncate font-sans text-sm font-medium text-text-primary">
          {name}
        </p>
        {discoverer.handle && (
          <p className="truncate font-sans text-xs text-text-muted">@{discoverer.handle}</p>
        )}
        <time
          dateTime={discoverer.discoveredAt}
          className="mt-0.5 block font-sans text-[11px] text-text-muted"
        >
          {formatShortDate(discoverer.discoveredAt, locale)}
        </time>
      </div>
    </Link>
  );
}

function formatShortDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
