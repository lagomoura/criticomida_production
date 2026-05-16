'use client';

import { useTranslations } from 'next-intl';
import { openReservation, withUtm } from '@/app/lib/utils/reservation';
import type { ReservationProvider } from '@/app/lib/types/restaurant';

interface ReservationCTAProps {
  slug: string;
  reservationUrl: string;
  reservationProvider: ReservationProvider | null;
}

const PROVIDER_KEY: Record<string, string> = {
  opentable: 'providerOpentable',
  thefork: 'providerThefork',
  cover: 'providerCover',
  mesaya: 'providerMesaya',
  tablecheck: 'providerTablecheck',
  whatsapp: 'providerWhatsapp',
  own_site: 'providerOwnSite',
};

export default function ReservationCTA({
  slug,
  reservationUrl,
  reservationProvider,
}: ReservationCTAProps) {
  const t = useTranslations('restaurant.reservation');
  const subLabel = reservationProvider
    ? PROVIDER_KEY[reservationProvider]
      ? t(PROVIDER_KEY[reservationProvider])
      : null
    : null;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    openReservation(slug, reservationUrl, reservationProvider ?? null);
  }

  return (
    <a
      href={withUtm(reservationUrl)}
      onClick={handleClick}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-terracota)] px-4 py-2 text-sm font-semibold text-[var(--color-espresso)] no-underline transition hover:bg-[var(--color-terracota-deep)] hover:text-white"
      data-testid="reservation-cta"
    >
      <span>{t('label')}</span>
      {subLabel ? (
        <span className="hidden text-xs font-normal opacity-90 sm:inline">
          {subLabel}
        </span>
      ) : null}
    </a>
  );
}
