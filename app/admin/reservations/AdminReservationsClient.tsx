'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import {
  getRestaurants,
  updateRestaurant,
} from '@/app/lib/api/restaurants';
import type { RestaurantListItem } from '@/app/lib/types/restaurant';

interface RowState {
  saving: boolean;
  error: string | null;
  saved: boolean;
  url: string;
  provider: string;
}

const PROVIDER_OPTIONS = [
  { value: '', label: '— sin proveedor —' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'own_site', label: 'Sitio del local' },
  { value: 'opentable', label: 'OpenTable' },
  { value: 'thefork', label: 'TheFork' },
  { value: 'cover', label: 'Cover' },
  { value: 'mesaya', label: 'MesaYa' },
  { value: 'tablecheck', label: 'TableCheck' },
];

export default function AdminReservationsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();

  const [items, setItems] = useState<RestaurantListItem[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getRestaurants({ per_page: 100 });
      setItems(page.items);
      const initial: Record<string, RowState> = {};
      for (const r of page.items) {
        initial[r.slug] = {
          saving: false,
          error: null,
          saved: false,
          url: '',
          provider: r.reservation_provider ?? '',
        };
      }
      setRows(initial);
    } catch {
      setError('No pudimos cargar el catálogo de restaurantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load();
    }
  }, [authLoading, user, load]);

  const handleSave = useCallback(async (slug: string) => {
    setRows((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], saving: true, error: null, saved: false },
    }));
    const row = rows[slug];
    try {
      await updateRestaurant(slug, {
        reservation_url: row.url || null,
        reservation_provider: row.provider || null,
      });
      setRows((prev) => ({
        ...prev,
        [slug]: { ...prev[slug], saving: false, saved: true },
      }));
      // Reflect in the list so the pill state matches without a re-fetch.
      setItems((prev) =>
        prev.map((r) =>
          r.slug === slug
            ? {
                ...r,
                has_reservation: Boolean(row.url),
                reservation_provider: row.provider || null,
              }
            : r,
        ),
      );
    } catch {
      setRows((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug],
          saving: false,
          error: 'No se pudo guardar.',
        },
      }));
    }
  }, [rows]);

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium">Acceso restringido</h1>
        <p className="font-sans text-sm text-text-muted">
          Esta página es solo para administradores.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          Reservas afiliadas
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Asociá una URL externa de reserva a cada restaurante. Hoy el catálogo
          se llena a mano; en una fase futura migramos a scraping/API del
          partner.
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
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={88} />
          ))}
        </div>
      )}

      {!loading && (
        <ul className="flex list-none flex-col gap-3 p-0">
          {items.map((restaurant) => {
            const row = rows[restaurant.slug];
            if (!row) return null;
            return (
              <li
                key={restaurant.id}
                className="rounded-2xl border border-border-default bg-surface-card p-4"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg">{restaurant.name}</h2>
                    <p className="font-sans text-xs text-text-muted">
                      {restaurant.location_name}
                    </p>
                  </div>
                  {restaurant.has_reservation && (
                    <span className="rounded-full bg-[var(--mainPink,#ef7998)] px-2 py-0.5 text-xs font-semibold text-white">
                      activo · {restaurant.reservation_provider ?? '—'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_auto]">
                  <input
                    type="url"
                    placeholder="URL de reserva (https://wa.me/..., https://opentable.com/r/...)"
                    value={row.url}
                    onChange={(e) =>
                      setRows((prev) => ({
                        ...prev,
                        [restaurant.slug]: {
                          ...prev[restaurant.slug],
                          url: e.target.value,
                          saved: false,
                        },
                      }))
                    }
                    className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
                  />
                  <select
                    value={row.provider}
                    onChange={(e) =>
                      setRows((prev) => ({
                        ...prev,
                        [restaurant.slug]: {
                          ...prev[restaurant.slug],
                          provider: e.target.value,
                          saved: false,
                        },
                      }))
                    }
                    className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
                  >
                    {PROVIDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    size="md"
                    loading={row.saving}
                    disabled={row.saving}
                    onClick={() => void handleSave(restaurant.slug)}
                  >
                    Guardar
                  </Button>
                </div>
                {row.error && (
                  <p className="mt-2 font-sans text-xs text-action-danger">
                    {row.error}
                  </p>
                )}
                {row.saved && (
                  <p className="mt-2 font-sans text-xs text-action-success">
                    Guardado.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
