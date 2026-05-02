'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { getB2bMetrics, type B2bMetricsResponse } from '@/app/lib/api/admin';

const CLAIM_STATUS_KEY: Record<string, string> = {
  pending: 'claimPending',
  verifying: 'claimVerifying',
  verified: 'claimVerified',
  rejected: 'claimRejected',
  revoked: 'claimRevoked',
};

export default function AdminMetricsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('admin.metrics');
  const [metrics, setMetrics] = useState<B2bMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics(await getB2bMetrics());
    } catch {
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load();
    }
  }, [authLoading, user, load]);

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[40vh] items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12 text-center">
        <h1 className="font-display text-3xl font-medium">{t('accessRestricted')}</h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-6 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          {t('title')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('subtitle')}
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-sm text-action-danger">
          {error}{' '}
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t('retry')}
          </Button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={110} />
          ))}
        </div>
      )}

      {metrics && (
        <>
          <Section title={t('reservationsHeading')}>
            <Stat label={t('statRestaurantsWithUrl')} value={metrics.reservations.restaurants_with_url} />
            <Stat label={t('statClicksTotal')} value={metrics.reservations.clicks_total} />
            <Stat label={t('statClicks7d')} value={metrics.reservations.clicks_last_7d} />
            <Stat label={t('statClicks30d')} value={metrics.reservations.clicks_last_30d} />
          </Section>

          {metrics.reservations.top_clicked.length > 0 && (
            <section className="rounded-2xl border border-border-default bg-surface-card p-4">
              <h3 className="mb-3 font-display text-base font-semibold">
                {t('topClicked')}
              </h3>
              <ul className="flex list-none flex-col gap-1 p-0">
                {metrics.reservations.top_clicked.map((r) => (
                  <li
                    key={r.slug}
                    className="flex items-center justify-between border-b border-border-default py-1.5 last:border-0"
                  >
                    <Link
                      href={`/restaurants/${r.slug}`}
                      className="font-sans text-sm text-action-primary hover:underline"
                    >
                      {r.name}
                    </Link>
                    <span className="font-mono text-sm font-semibold">
                      {r.clicks}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Section title={t('claimsHeading')}>
            <Stat
              label={t('statClaimed')}
              value={`${metrics.claims.restaurants_claimed} / ${metrics.claims.restaurants_total}`}
              hint={t('coverageHint', { pct: metrics.claims.coverage_pct })}
            />
            {Object.entries(metrics.claims.by_status).map(([status, count]) => (
              <Stat
                key={status}
                label={CLAIM_STATUS_KEY[status] ? t(CLAIM_STATUS_KEY[status]) : status}
                value={count}
              />
            ))}
          </Section>

          <Section title={t('engagementHeading')}>
            <Stat
              label={t('statResponses')}
              value={`${metrics.owner_engagement.reviews_with_response} / ${metrics.owner_engagement.reviews_total}`}
              hint={t('responsesHint', { pct: metrics.owner_engagement.response_coverage_pct })}
            />
            <Stat
              label={t('statOfficialPhotos')}
              value={metrics.owner_engagement.official_photos_total}
            />
            <Stat
              label={t('statRestaurantsWithPhotos')}
              value={metrics.owner_engagement.restaurants_with_photos}
            />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-medium">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-card p-4">
      <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-medium">{value}</p>
      {hint && (
        <p className="mt-1 font-sans text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}
