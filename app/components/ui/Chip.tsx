'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export default function Chip({
  children,
  selected = false,
  onClick,
  onRemove,
  removeLabel,
  className,
}: ChipProps) {
  const t = useTranslations('chip');
  const resolvedRemoveLabel = removeLabel ?? t('remove');
  const base = cn(
    'inline-flex h-7 items-center gap-1 rounded-full border px-3 font-sans text-xs transition-colors',
    selected
      ? 'border-transparent bg-action-primary text-text-inverse'
      : 'border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle',
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={resolvedRemoveLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-current hover:bg-black/10"
        >
          ×
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={cn(base, 'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]')}
      >
        {content}
      </button>
    );
  }

  return <span className={base}>{content}</span>;
}
