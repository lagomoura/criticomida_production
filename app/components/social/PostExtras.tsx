'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faXmark,
  faUtensils,
  faCalendar,
  faUserGroup,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import Chip from '@/app/components/ui/Chip';
import type { ReviewExtras, PortionSize } from '@/app/lib/types/social';

export interface PostExtrasProps {
  extras: ReviewExtras;
  className?: string;
}

export default function PostExtras({ extras, className }: PostExtrasProps) {
  const t = useTranslations('social.postExtras');
  const locale = useLocale();

  const portionLabel: Record<PortionSize, string> = {
    small: t('portionSmall'),
    medium: t('portionMedium'),
    large: t('portionLarge'),
  };

  const hasMeta =
    extras.portionSize ||
    extras.wouldOrderAgain !== undefined ||
    extras.priceTier ||
    extras.dateTasted ||
    extras.visitedWith;

  const hasProsCons = (extras.pros?.length ?? 0) > 0 || (extras.cons?.length ?? 0) > 0;
  const hasTags = (extras.tags?.length ?? 0) > 0;

  if (!hasMeta && !hasProsCons && !hasTags) return null;

  return (
    <div className={className}>
      {hasMeta && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm text-text-secondary">
          {extras.portionSize && (
            <MetaItem icon={faUtensils}>{portionLabel[extras.portionSize]}</MetaItem>
          )}
          {extras.wouldOrderAgain !== undefined && extras.wouldOrderAgain !== null && (
            <MetaItem
              icon={extras.wouldOrderAgain ? faCheck : faXmark}
              tone={extras.wouldOrderAgain ? 'positive' : 'negative'}
            >
              {extras.wouldOrderAgain ? t('wouldOrderAgain') : t('wouldNotOrderAgain')}
            </MetaItem>
          )}
          {extras.priceTier && <MetaItem icon={faDollarSign}>{extras.priceTier}</MetaItem>}
          {extras.dateTasted && (
            <MetaItem icon={faCalendar}>
              <time dateTime={extras.dateTasted}>{formatTastedDate(extras.dateTasted, locale)}</time>
            </MetaItem>
          )}
          {extras.visitedWith && <MetaItem icon={faUserGroup}>{extras.visitedWith}</MetaItem>}
        </ul>
      )}

      {hasProsCons && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {extras.pros && extras.pros.length > 0 && (
            <ProsConsList items={extras.pros} tone="positive" label={t('pros')} icon={faCheck} />
          )}
          {extras.cons && extras.cons.length > 0 && (
            <ProsConsList items={extras.cons} tone="negative" label={t('cons')} icon={faXmark} />
          )}
        </div>
      )}

      {hasTags && (
        <div className="mt-4 flex flex-wrap gap-2">
          {extras.tags!.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaItem({
  icon,
  tone,
  children,
}: {
  icon: typeof faCheck;
  tone?: 'positive' | 'negative';
  children: React.ReactNode;
}) {
  const iconColor =
    tone === 'positive'
      ? 'text-action-secondary'
      : tone === 'negative'
        ? 'text-action-danger'
        : 'text-text-muted';
  return (
    <li className="inline-flex items-center gap-1.5">
      <FontAwesomeIcon icon={icon} className={`h-3.5 w-3.5 ${iconColor}`} aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function ProsConsList({
  items,
  tone,
  label,
  icon,
}: {
  items: string[];
  tone: 'positive' | 'negative';
  label: string;
  icon: typeof faCheck;
}) {
  const iconColor = tone === 'positive' ? 'text-action-secondary' : 'text-action-danger';
  return (
    <section aria-labelledby={`prosCons-${label}`}>
      <h4
        id={`prosCons-${label}`}
        className="mb-2 font-sans text-xs font-medium uppercase tracking-wider text-text-muted"
      >
        {label}
      </h4>
      <ul className="flex list-none flex-col gap-1.5 p-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 font-sans text-sm text-text-primary">
            <FontAwesomeIcon icon={icon} className={`mt-1 h-3 w-3 shrink-0 ${iconColor}`} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatTastedDate(iso: string, locale: string): string {
  try {
    const date = new Date(iso + 'T00:00:00');
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  } catch {
    return iso;
  }
}
