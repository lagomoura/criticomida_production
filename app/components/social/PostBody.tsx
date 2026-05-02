'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';

export interface PostBodyProps {
  text: string;
  alwaysExpanded?: boolean;
  showExpandToggle?: boolean;
  className?: string;
}

export default function PostBody({
  text,
  alwaysExpanded = false,
  showExpandToggle = true,
  className,
}: PostBodyProps) {
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const t = useTranslations('social.post');
  const isExpanded = alwaysExpanded || expanded;
  const canToggle = showExpandToggle && !alwaysExpanded && !expanded;

  return (
    <div className={cn('font-sans text-[15px] leading-relaxed text-text-primary sm:text-base', className)}>
      <p
        className={cn(
          'whitespace-pre-wrap',
          !isExpanded && 'line-clamp-4 sm:line-clamp-6',
          isExpanded &&
            'first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-[3.25rem] first-letter:font-medium first-letter:italic first-letter:leading-[0.85] first-letter:text-action-primary',
        )}
      >
        {text}
      </p>
      {canToggle && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 font-sans text-sm text-action-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          {t('viewMore')}
        </button>
      )}
    </div>
  );
}
