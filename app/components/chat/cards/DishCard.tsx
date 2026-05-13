'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark as faBookmarkRegular,
  faMapLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { fetchApi } from '@/app/lib/api/client';
import { DishCardData } from '@/app/lib/api/chat';
import { cn } from '@/app/lib/utils/cn';

interface DishCardProps {
  dish: DishCardData;
  /** Called when the user wants to see this dish on the map. */
  onShowOnMap?: (dish: DishCardData) => void;
  /**
   * Fired synchronously when the comensal taps the card's thumb,
   * dish name or restaurant name — i.e. about to navigate away.
   * ``ChatDrawer`` wires this to ``onClose`` so the drawer slides
   * off and the destination page (dish detail / restaurant detail)
   * isn't covered by a still-open chat. Without it, the comensal
   * lands on the page but the chat keeps obscuring the hero.
   */
  onNavigate?: () => void;
}

/**
 * Compact dish card rendered inside chat tool results.
 *
 * Visually echoes the editorial PlateCard but stays slim so multiple
 * cards can flow inside the chat drawer without dominating the
 * conversation.
 */
export default function DishCard({
  dish,
  onShowOnMap,
  onNavigate,
}: DishCardProps) {
  const t = useTranslations('chat.dishCard');
  // Rutas de la app viven bajo ``app/[locale]/...`` con next-intl, así
  // que cualquier ``Link`` que arrancara con ``/dishes`` o
  // ``/restaurants`` cae en una 404 silenciosa. El resto del proyecto
  // prefija el locale manualmente — replicamos ese patrón acá.
  const locale = useLocale();
  // Seed the saved state from the server-side flag so a refresh
  // doesn't reset the chip to "Quiero probar" for dishes the
  // comensal already has in their want-to-try list.
  const [saved, setSaved] = useState<boolean>(Boolean(dish.want_to_try));
  const [savePending, setSavePending] = useState(false);

  async function handleSave() {
    if (saved || savePending) return;
    setSavePending(true);
    try {
      // Reuses the existing wishlist endpoint — same row the chat tool
      // would create, but we let the user click directly here too.
      await fetchApi(`/api/dishes/${dish.dish_id}/want-to-try`, {
        method: 'POST',
      });
      setSaved(true);
    } catch {
      // Silent: the user can retry; we don't want a toast in the chat.
    } finally {
      setSavePending(false);
    }
  }

  const restaurantHref = `/${locale}/restaurants/${dish.restaurant.slug}`;
  const dishHref = `/${locale}/dishes/${dish.dish_id}`;

  return (
    <article
      className={cn(
        'group flex gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3',
        'transition-shadow hover:shadow-[var(--shadow-elevated)]',
      )}
    >
      <Link
        href={dishHref}
        onClick={onNavigate}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-subtle"
      >
        {dish.cover_image_url ? (
          <Image
            src={dish.cover_image_url}
            alt={dish.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
            {t('noPhoto')}
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={dishHref}
              onClick={onNavigate}
              className="line-clamp-1 font-display text-base font-medium text-text-primary hover:text-action-primary"
            >
              {dish.name}
            </Link>
            <Link
              href={restaurantHref}
              onClick={onNavigate}
              className="line-clamp-1 text-xs text-text-muted hover:text-text-primary"
            >
              {dish.restaurant.name} · {dish.restaurant.location_name}
            </Link>
          </div>
          {dish.rating !== null && (
            <span className="shrink-0 rounded-full bg-action-highlight/20 px-2 py-0.5 text-xs font-medium text-text-primary">
              ★ {dish.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 text-[11px] text-text-muted">
          {dish.price_tier && (
            <span className="rounded-md bg-surface-subtle px-1.5 py-0.5">
              {dish.price_tier}
            </span>
          )}
          {dish.restaurant.category && (
            <span className="rounded-md bg-surface-subtle px-1.5 py-0.5">
              {dish.restaurant.category}
            </span>
          )}
          <span className="rounded-md bg-surface-subtle px-1.5 py-0.5">
            {t('reviewCount', { count: dish.review_count })}
          </span>
        </div>

        <div className="mt-1 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saved || savePending}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-text-primary transition-colors',
              'hover:bg-surface-card disabled:opacity-60',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
            )}
          >
            <FontAwesomeIcon
              icon={saved ? faBookmarkSolid : faBookmarkRegular}
              aria-hidden
              className="h-3 w-3"
            />
            {saved ? t('saved') : t('save')}
          </button>
          {onShowOnMap && dish.restaurant.lat !== null && (
            <button
              onClick={() => onShowOnMap(dish)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-text-primary',
                'hover:bg-surface-card',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
            >
              <FontAwesomeIcon
                icon={faMapLocationDot}
                aria-hidden
                className="h-3 w-3"
              />
              {t('showOnMap')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
