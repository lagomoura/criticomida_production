'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { parseOpeningHours } from '@/app/lib/utils/openingHours';

interface OpenStatusProps {
  openingHours: string[] | null;
  variant?: 'badge' | 'inline';
}

export default function OpenStatus({ openingHours, variant = 'badge' }: OpenStatusProps) {
  const t = useTranslations('restaurant.openStatus');
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!openingHours || openingHours.length === 0) return null;
  if (now === null) return null;

  const status = parseOpeningHours(openingHours, now);
  if (!status.hasHours) return null;

  const label = status.isOpen
    ? status.closesAt
      ? t('openClosesAt', { time: status.closesAt })
      : t('open')
    : status.opensAt
      ? t('closedOpensAt', { time: status.opensAt })
      : t('closed');

  const tone = status.isOpen
    ? 'bg-[var(--color-dorado-pale)] text-[var(--color-dorado)]'
    : 'bg-[var(--color-terracota-pale)] text-[var(--color-terracota-deep)]';

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-medium ${status.isOpen ? 'text-[var(--color-dorado)]' : 'text-[var(--color-terracota-deep)]'}`}>
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? 'bg-[var(--color-dorado)]' : 'bg-[var(--color-terracota-deep)]'}`} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? 'bg-[var(--color-dorado)]' : 'bg-[var(--color-terracota-deep)]'}`} />
      {label}
    </span>
  );
}
