'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling, faWineGlass, faCrown } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import type { MasteryLevel } from '@/app/lib/types/social';
import { cn } from '@/app/lib/utils/cn';

export interface MasteryBadgeProps {
  level: MasteryLevel;
  variant?: 'compact' | 'full';
  category?: string;
  className?: string;
}

const ICON: Record<MasteryLevel, typeof faSeedling> = {
  apprentice: faSeedling,
  sommelier: faWineGlass,
  master: faCrown,
};

const STYLE: Record<MasteryLevel, string> = {
  apprentice:
    'border-[color:var(--color-canela)]/35 bg-[color:var(--color-canela)]/10 text-[color:var(--color-canela)]',
  sommelier:
    'border-[color:var(--color-azafran)]/40 bg-[color:var(--color-azafran)]/12 text-[color:var(--color-azafran)]',
  master:
    'border-[color:var(--color-azafran)] bg-[color:var(--color-azafran)] text-white shadow-[0_1px_0_rgba(0,0,0,0.05)]',
};

export default function MasteryBadge({
  level,
  category,
  variant = 'full',
  className,
}: MasteryBadgeProps) {
  const t = useTranslations('mastery');
  const titleByLevel: Record<MasteryLevel, string> = {
    apprentice: t('apprenticeTitle'),
    sommelier: t('sommelierTitle'),
    master: t('masterTitle'),
  };
  const tooltipByLevel: Record<MasteryLevel, string> = {
    apprentice: t('apprenticeTooltip'),
    sommelier: t('sommelierTooltip'),
    master: t('masterTooltip'),
  };
  const title = titleByLevel[level];
  const tooltip = tooltipByLevel[level];
  const label =
    variant === 'compact' || !category
      ? title
      : t('ofCategory', { title, category });
  return (
    <span
      role="img"
      aria-label={t('ariaLabel', { label, tooltip })}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.08em]',
        STYLE[level],
        className,
      )}
    >
      <FontAwesomeIcon icon={ICON[level]} className="h-2.5 w-2.5" aria-hidden />
      <span className="leading-none">{label}</span>
    </span>
  );
}
