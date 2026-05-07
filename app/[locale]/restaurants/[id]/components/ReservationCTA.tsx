'use client';

import { useTranslations } from 'next-intl';
import { logReservationClick } from '@/app/lib/api/restaurants';
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

const UTM_PARAMS: Record<string, string> = {
  utm_source: 'palato',
  utm_medium: 'referral',
  utm_campaign: 'reservation_cta',
};

function withUtm(url: string): string {
  try {
    const u = new URL(url);
    for (const [key, value] of Object.entries(UTM_PARAMS)) {
      if (!u.searchParams.has(key)) u.searchParams.set(key, value);
    }
    return u.toString();
  } catch {
    return url;
  }
}

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
    void logReservationClick(slug, {
      provider: reservationProvider ?? null,
      utm: UTM_PARAMS,
      referrer: typeof window !== 'undefined' ? window.location.href : null,
    });
    window.open(withUtm(reservationUrl), '_blank', 'noopener,noreferrer');
  }

  return (
    <a
      href={withUtm(reservationUrl)}
      onClick={handleClick}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mainPink,#ef7998)] px-4 py-2 text-sm font-semibold text-white no-underline transition hover:opacity-90"
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
