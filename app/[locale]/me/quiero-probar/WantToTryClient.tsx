'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { useToast } from '@/app/components/ui/Toast';
import {
  getMyWantToTry,
  removeFromWantToTry,
} from '@/app/lib/api/want-to-try';
import { useUserLocation, distanceKm } from '@/app/lib/hooks/useUserLocation';
import type { WantToTryItem } from '@/app/lib/types/social';

type Status = 'loading' | 'ready' | 'error';

export default function WantToTryClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const { location } = useUserLocation();

  const [items, setItems] = useState<WantToTryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFirst = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await getMyWantToTry();
      setItems(page.items);
      setNextCursor(page.nextCursor);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await getMyWantToTry(nextCursor);
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      /* swallowed; user can scroll later */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor]);

  useEffect(() => {
    if (!authLoading && user) void loadFirst();
  }, [authLoading, user, loadFirst]);

  const handleRemove = useCallback(
    async (dishId: string) => {
      const previous = items;
      setItems((prev) => prev.filter((it) => it.dishId !== dishId));
      try {
        await removeFromWantToTry(dishId);
      } catch {
        setItems(previous);
        toast.error('No se pudo quitar de tu lista', 'Probá de nuevo en un momento.');
      }
    },
    [items, toast],
  );

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon
          icon={faBookmark}
          className="h-8 w-8 text-text-muted"
          aria-hidden
        />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          Iniciá sesión para ver tu lista
        </h1>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
          Quiero probar
        </h1>
        <p className="mt-1 font-sans text-sm text-text-muted">
          Lo que pediste que te recordáramos. Para cuando no sepas qué cenar.
        </p>
      </header>

      {status === 'loading' && (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-border-subtle bg-surface-card"
            />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <p className="mb-3 font-sans text-sm text-text-secondary">
            No pudimos cargar tu lista. Probá de nuevo.
          </p>
          <Button variant="outline" size="sm" onClick={() => void loadFirst()}>
            Intentar de nuevo
          </Button>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface-card px-6 py-12 text-center">
          <FontAwesomeIcon
            icon={faBookmark}
            className="h-7 w-7 text-text-muted"
            aria-hidden
          />
          <h2 className="font-display text-xl font-medium text-text-primary">
            Todavía no guardaste platos
          </h2>
          <p className="font-sans text-sm text-text-muted">
            En el feed, tocá &ldquo;Quiero probarlo&rdquo; en cualquier plato y aparecerá acá.
          </p>
          <Button variant="primary" size="sm" onClick={() => router.push('/')}>
            Explorar el feed
          </Button>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <WantToTryRow
              key={item.dishId}
              item={item}
              userLat={location?.latitude}
              userLng={location?.longitude}
              onRemove={() => void handleRemove(item.dishId)}
            />
          ))}
        </ul>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            loading={loadingMore}
            onClick={() => void loadMore()}
          >
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  item: WantToTryItem;
  userLat?: number;
  userLng?: number;
  onRemove: () => void;
}

function WantToTryRow({ item, userLat, userLng, onRemove }: RowProps) {
  const distance =
    userLat !== undefined &&
    userLng !== undefined &&
    item.restaurantLatitude !== null &&
    item.restaurantLongitude !== null
      ? distanceKm(
          { latitude: userLat, longitude: userLng },
          {
            latitude: item.restaurantLatitude,
            longitude: item.restaurantLongitude,
          },
        )
      : null;

  return (
    <li className="flex gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3">
      <Link
        href={`/dishes/${item.dishId}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-subtle"
      >
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt={item.dishName}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
            sin foto
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/dishes/${item.dishId}`}
          className="truncate font-display text-base font-semibold text-text-primary no-underline hover:underline"
        >
          {item.dishName}
        </Link>
        <Link
          href={`/restaurants/${encodeURIComponent(item.restaurantSlug)}`}
          className="truncate font-sans text-sm text-text-muted no-underline hover:underline"
        >
          {item.restaurantName}
          {item.restaurantCity ? ` · ${item.restaurantCity}` : ''}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs text-text-muted">
          <span>★ {item.computedRating.toFixed(1)}</span>
          <span>{item.reviewCount} reseñas</span>
          {distance !== null && (
            <span className="inline-flex items-center gap-1">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="h-3 w-3"
                aria-hidden
              />
              {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="self-start rounded-full border border-border-default bg-white px-3 py-1 font-sans text-xs font-medium text-text-secondary transition hover:border-action-danger hover:text-action-danger"
        aria-label={`Quitar ${item.dishName} de tu lista`}
      >
        Quitar
      </button>
    </li>
  );
}
