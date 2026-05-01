'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { getB2bMetrics, type B2bMetricsResponse } from '@/app/lib/api/admin';

const CLAIM_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendientes',
  verifying: 'En verificación',
  verified: 'Verificados',
  rejected: 'Rechazados',
  revoked: 'Revocados',
};

export default function AdminMetricsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const [metrics, setMetrics] = useState<B2bMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics(await getB2bMetrics());
    } catch {
      setError('No pudimos cargar las métricas.');
    } finally {
      setLoading(false);
    }
  }, []);

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
        <h1 className="font-display text-3xl font-medium">Acceso restringido</h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-6 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          Métricas B2B
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Foto del estado del pilar de monetización: reservas, claims y
          engagement del owner.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-4 text-sm text-action-danger">
          {error}{' '}
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Reintentar
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
          <Section title="Reservas afiliadas">
            <Stat label="Locales con URL" value={metrics.reservations.restaurants_with_url} />
            <Stat label="Clicks totales" value={metrics.reservations.clicks_total} />
            <Stat
              label="Clicks 7 días"
              value={metrics.reservations.clicks_last_7d}
            />
            <Stat
              label="Clicks 30 días"
              value={metrics.reservations.clicks_last_30d}
            />
          </Section>

          {metrics.reservations.top_clicked.length > 0 && (
            <section className="rounded-2xl border border-border-default bg-surface-card p-4">
              <h3 className="mb-3 font-display text-base font-semibold">
                Top 5 con más clicks
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

          <Section title="Claim flow">
            <Stat
              label="Locales reclamados"
              value={`${metrics.claims.restaurants_claimed} / ${metrics.claims.restaurants_total}`}
              hint={`${metrics.claims.coverage_pct}% del catálogo`}
            />
            {Object.entries(metrics.claims.by_status).map(([status, count]) => (
              <Stat
                key={status}
                label={CLAIM_STATUS_LABEL[status] ?? status}
                value={count}
              />
            ))}
          </Section>

          <Section title="Engagement del owner">
            <Stat
              label="Reseñas con respuesta"
              value={`${metrics.owner_engagement.reviews_with_response} / ${metrics.owner_engagement.reviews_total}`}
              hint={`${metrics.owner_engagement.response_coverage_pct}% respondidas`}
            />
            <Stat
              label="Fotos oficiales"
              value={metrics.owner_engagement.official_photos_total}
            />
            <Stat
              label="Restaurants con fotos"
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
