'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark,
  faLocationDot,
  faStar,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

import type {
  ComparisonDishEntry,
  ComparisonResult,
  DishCardData,
} from '@/app/lib/api/chat';
import { addToWantToTry } from '@/app/lib/api/want-to-try';
import { cn } from '@/app/lib/utils/cn';

interface Props {
  result: ComparisonResult;
  /** Mirrors DishCard.onShowOnMap so the comensal can jump to a
   *  comparison column on the discovery map. We synthesise a
   *  ``DishCardData``-shaped object from the comparison entry to
   *  reuse the existing handler — the map page only needs the
   *  ids and the restaurant lat/lng. */
  onShowDishOnMap?: (dish: DishCardData) => void;
  /** Mirrors ``DishCard.onNavigate``: fired right before the user
   *  navigates away by clicking a column's title link, so the chat
   *  drawer can close itself and not cover the destination page. */
  onNavigate?: () => void;
}

/**
 * Side-by-side comparative grid for ``compare_dishes``.
 *
 * The grid lives below the agent's editorial sentence (texto
 * primero / cards después). Two columns on phones, three or four
 * on desktop depending on how many dishes the agent passed.
 *
 * Each column lists the dish photo, name + restaurant + location,
 * an aggregate rating with the Albahaca badge for ratings ≥ 4.5,
 * the price tier, a per-pillar mini bar chart, the two most-cited
 * pros/cons, and the same Save / Show-on-map CTAs as DishCard.
 *
 * The pillar bars use the brand v2 colours: Páprika for
 * presentation, Albahaca for execution, Azafrán for value_prop.
 * The proportional fill is ``pillar_value / 3`` because the dish
 * pillar scale is 1-3 (see ``DishReview`` constraints in the
 * backend).
 */
export default function ComparisonCard({
  result,
  onShowDishOnMap,
  onNavigate,
}: Props) {
  const t = useTranslations('chat.comparisonCard');
  const locale = useLocale();
  const dishes = result.dishes;

  if (!dishes || dishes.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-muted">
        {t('empty')}
      </div>
    );
  }

  // 2 dishes → 2 cols mobile + 2 cols desktop. 3-4 → 2 mobile, 3-4 desktop.
  const desktopCols =
    dishes.length === 2 ? 'sm:grid-cols-2'
    : dishes.length === 3 ? 'sm:grid-cols-3'
    : 'sm:grid-cols-4';

  return (
    <section
      aria-label={t('heading')}
      className="rounded-2xl border border-border-subtle bg-surface-card p-3"
    >
      <header className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
        <FontAwesomeIcon icon={faUtensils} className="h-3 w-3" aria-hidden />
        {t('heading')}
      </header>

      <div className={cn('grid grid-cols-2 gap-2', desktopCols)}>
        {dishes.map((dish, idx) => (
          <ComparisonColumn
            key={dish.dish_id}
            dish={dish}
            highlightLeader={idx === 0}
            onShowDishOnMap={onShowDishOnMap}
            onNavigate={onNavigate}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

interface ColumnProps {
  dish: ComparisonDishEntry;
  /** First column gets a subtle Azafrán ring — the agent passed it
   *  first, which by contract is the lead recommendation. */
  highlightLeader: boolean;
  onShowDishOnMap?: (dish: DishCardData) => void;
  onNavigate?: () => void;
  locale: string;
}

function ComparisonColumn({
  dish,
  highlightLeader,
  onShowDishOnMap,
  onNavigate,
  locale,
}: ColumnProps) {
  const t = useTranslations('chat.comparisonCard');
  // Seed from the server-side flag so the chip survives refreshes —
  // see ``DishCard`` for the same pattern.
  const [saved, setSaved] = useState<boolean>(Boolean(dish.want_to_try));
  const [savePending, setSavePending] = useState(false);

  const ratingLabel =
    dish.rating !== null ? dish.rating.toFixed(1) : null;
  const ratingClass =
    dish.rating !== null && dish.rating >= 4.5
      ? 'bg-[var(--color-dorado)] text-white'
      : 'bg-surface-subtle text-text-primary';

  // Use the canonical ``addToWantToTry`` helper instead of a raw
  // fetchApi call so we share the same encoding + error handling
  // path as the standalone wishlist UI. Idempotent on the server
  // (the row's compound PK absorbs duplicates). Local state gives
  // the comensal feedback so the click doesn't look dead.
  async function handleSave() {
    if (saved || savePending) return;
    setSavePending(true);
    try {
      await addToWantToTry(dish.dish_id);
      setSaved(true);
    } catch (err) {
      // Surface to the dev console so we don't lose silent failures
      // — e.g. the comensal looks logged in but the cookie expired
      // and the refresh path also failed. The card stays in its
      // pre-save state in that case (button still says "Quiero
      // probar"), so the comensal can retry.
      console.warn('[ComparisonCard] addToWantToTry failed', err);
    } finally {
      setSavePending(false);
    }
  }

  // Reuse the existing map handler by synthesising a DishCardData
  // shape. We only need the fields the handler actually reads
  // (dish_id + restaurant.lat/lng), but TypeScript wants the full
  // shape — so we fill in safe defaults for the rest. The button
  // only renders when lat AND lng are present, so this branch is
  // never reached without coordinates.
  const canShowOnMap =
    typeof dish.lat === 'number' &&
    typeof dish.lng === 'number' &&
    Number.isFinite(dish.lat) &&
    Number.isFinite(dish.lng);

  const synthesisedForMap: DishCardData | null = canShowOnMap
    ? {
        dish_id: dish.dish_id,
        name: dish.name,
        description: null,
        cover_image_url: dish.cover_image_url,
        rating: dish.rating,
        review_count: dish.review_count,
        price_tier: dish.price_tier,
        restaurant: {
          id: dish.restaurant_slug ?? dish.dish_id,
          slug: dish.restaurant_slug ?? '',
          name: dish.restaurant_name ?? '',
          location_name: dish.location_name ?? '',
          city: '',
          lat: dish.lat as number,
          lng: dish.lng as number,
          category: null,
          has_reservation: false,
          is_claimed: false,
          reservation_url: null,
          reservation_provider: null,
        },
      }
    : null;

  function handleShowOnMap() {
    if (!synthesisedForMap || !onShowDishOnMap) return;
    try {
      onShowDishOnMap(synthesisedForMap);
    } catch {
      // Defensive: a navigation failure shouldn't crash the card.
      // The onShowDishOnMap handler in ChatDrawer dispatches a
      // router.push; if that throws (rare, but happens during
      // hot-reload in dev) we'd rather swallow than crash the row.
    }
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-xl border bg-surface-card p-2',
        highlightLeader
          ? 'border-action-primary/40 [box-shadow:0_0_0_1px_var(--color-terracota-pale)]'
          : 'border-border-subtle',
      )}
    >
      {/* Photo + rating badge in the corner */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-subtle">
        {dish.cover_image_url ? (
          <Image
            src={dish.cover_image_url}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            {t('noPhoto')}
          </div>
        )}
        {ratingLabel && (
          <span
            className={cn(
              'absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              ratingClass,
            )}
          >
            <FontAwesomeIcon icon={faStar} className="h-2.5 w-2.5" aria-hidden />
            {ratingLabel}
          </span>
        )}
      </div>

      {/* Title block */}
      <div className="flex flex-col gap-0.5">
        <h3 className="font-display text-sm leading-tight text-text-primary">
          {dish.restaurant_slug ? (
            <Link
              href={`/${locale}/restaurants/${dish.restaurant_slug}`}
              onClick={onNavigate}
              className="hover:text-action-primary"
            >
              {dish.name}
            </Link>
          ) : (
            dish.name
          )}
        </h3>
        {dish.restaurant_name && (
          <p className="text-[11px] leading-tight text-text-muted">
            {dish.restaurant_name}
            {dish.location_name ? ` · ${dish.location_name}` : ''}
          </p>
        )}
        {dish.price_tier && (
          <span className="text-[11px] font-medium text-text-muted">
            {dish.price_tier}
          </span>
        )}
      </div>

      {/* Pillar mini-bars. Each bar is `value/3` wide; null pillars
          render as a flat empty track so columns line up vertically. */}
      <div className="flex flex-col gap-1 text-[10px]">
        <PillarBar
          label={t('pillars.presentation')}
          value={dish.pillar_breakdown.presentation}
          accent="var(--color-terracota-deep)"
        />
        <PillarBar
          label={t('pillars.execution')}
          value={dish.pillar_breakdown.execution}
          accent="var(--color-dorado)"
        />
        <PillarBar
          label={t('pillars.value_prop')}
          value={dish.pillar_breakdown.value_prop}
          accent="var(--color-terracota)"
        />
      </div>

      {/* Pros / cons. Empty arrays just collapse out — no "Sin datos" line. */}
      {dish.top_pros.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-action-primary">
            {t('pros')}
          </span>
          <ul className="text-[11px] leading-tight text-text-primary">
            {dish.top_pros.map((p, i) => (
              <li key={`${dish.dish_id}-pro-${i}`}>· {p}</li>
            ))}
          </ul>
        </div>
      )}
      {dish.top_cons.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-action-danger">
            {t('cons')}
          </span>
          <ul className="text-[11px] leading-tight text-text-primary">
            {dish.top_cons.map((c, i) => (
              <li key={`${dish.dish_id}-con-${i}`}>· {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTAs — same intent as DishCard so the comensal's flow is
          consistent across card types. */}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saved || savePending}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors',
            saved
              ? 'border-action-primary/40 bg-action-primary/10 text-action-primary'
              : 'border-border-default bg-surface-card text-text-primary hover:border-action-primary hover:text-action-primary',
            'disabled:cursor-not-allowed disabled:opacity-70',
          )}
        >
          <FontAwesomeIcon icon={faBookmark} className="h-2.5 w-2.5" aria-hidden />
          {saved ? t('saved') : t('save')}
        </button>
        {synthesisedForMap && onShowDishOnMap && (
          <button
            type="button"
            onClick={handleShowOnMap}
            className="inline-flex items-center gap-1 rounded-full border border-border-default bg-surface-card px-2 py-0.5 text-[11px] text-text-primary hover:border-action-primary hover:text-action-primary"
          >
            <FontAwesomeIcon icon={faLocationDot} className="h-2.5 w-2.5" aria-hidden />
            {t('showOnMap')}
          </button>
        )}
      </div>
    </article>
  );
}

interface PillarBarProps {
  label: string;
  /** 1-3 scale, or null when no review has rated this pillar yet. */
  value: number | null;
  /** CSS variable string like ``var(--color-terracota-deep)``. */
  accent: string;
}

function PillarBar({ label, value, accent }: PillarBarProps) {
  // Bars normalise on the dish-pillar scale (1-3). Null collapses
  // to an empty track so columns stay aligned visually.
  const pct = value !== null ? Math.max(0, Math.min(100, (value / 3) * 100)) : 0;
  return (
    <div className="grid grid-cols-[64px_1fr_24px] items-center gap-1.5">
      <span className="truncate text-text-muted">{label}</span>
      <span className="relative h-1.5 overflow-hidden rounded-full bg-surface-subtle">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </span>
      <span className="text-right text-text-primary">
        {value !== null ? value.toFixed(1) : '—'}
      </span>
    </div>
  );
}
