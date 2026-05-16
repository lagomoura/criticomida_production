import { logReservationClick } from '@/app/lib/api/restaurants';

const UTM_PARAMS: Record<string, string> = {
  utm_source: 'palato',
  utm_medium: 'referral',
  utm_campaign: 'reservation_cta',
};

/** Append Palato attribution params without clobbering any the
 *  partner URL already carries. Returns the input untouched if it
 *  isn't a parseable absolute URL. */
export function withUtm(url: string): string {
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

/**
 * Fire the reservation-click beacon and open the partner deeplink in
 * a new tab. Tracking is best-effort and never blocks the open — the
 * single source of truth for "what a reservation click does" so the
 * page CTA and the wishlist CTAs stay byte-for-byte consistent.
 */
export function openReservation(
  slug: string,
  url: string,
  provider: string | null,
): void {
  void logReservationClick(slug, {
    provider: provider ?? null,
    utm: UTM_PARAMS,
    referrer: typeof window !== 'undefined' ? window.location.href : null,
  });
  window.open(withUtm(url), '_blank', 'noopener,noreferrer');
}
