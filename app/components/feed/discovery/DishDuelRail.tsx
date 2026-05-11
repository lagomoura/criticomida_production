'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getDishDuel, getDuelFamilies } from '@/app/lib/api/discovery';
import {
  addToWantToTry,
  removeFromWantToTry,
} from '@/app/lib/api/want-to-try';
import { useToast } from '@/app/components/ui/Toast';
import type {
  DishDuel,
  DuelFamily,
  DuelPillar,
} from '@/app/lib/types/social';
import Rail from './Rail';
import DishDiscoveryCard from './DishDiscoveryCard';

interface DishDuelRailProps {
  enableWishlist: boolean;
}

const PILLARS: DuelPillar[] = [
  'value_prop',
  'execution',
  'presentation',
  'overall_rating',
];

const PILLAR_LABEL_KEY: Record<DuelPillar, string> = {
  value_prop: 'pillarValueProp',
  execution: 'pillarExecution',
  presentation: 'pillarPresentation',
  overall_rating: 'pillarOverallRating',
};

/** Cuántas familias máximo cargamos como slides al inicio. */
const MAX_SLIDES = 6;
/** Intervalo del auto-advance (ms). 7s da tiempo a leer ambos cards. */
const AUTO_ADVANCE_MS = 7000;

/**
 * Duelo de Platos — carrusel auto-advance de duelos por familia semántica.
 *
 * Cambios respecto a la primera versión:
 * - Familia (burger, pizza, ...) reemplaza al root específico: un cheeseburger
 *   ahora puede enfrentar un sandwich porque comparten familia "burger".
 * - Carrusel: la app va pasando entre familias automáticamente. El usuario no
 *   elige cuál ver — descubre.
 * - Empty state nombra qué familia/restaurante falta para que el rail no
 *   muestre un mensaje genérico.
 */
export default function DishDuelRail({ enableWishlist }: DishDuelRailProps) {
  const toast = useToast();
  const t = useTranslations('discovery.duel');
  const tErr = useTranslations('discovery.wishlistError');

  const [families, setFamilies] = useState<DuelFamily[] | null>(null);
  const [activePillar, setActivePillar] = useState<DuelPillar>('value_prop');
  const [slides, setSlides] = useState<DishDuel[] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar las familias top una vez al montar.
  useEffect(() => {
    let cancelled = false;
    getDuelFamilies({ limit: MAX_SLIDES, minRestaurants: 2 })
      .then((fs) => {
        if (cancelled) return;
        setFamilies(fs);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar los duelos (uno por familia) cada vez que cambian families o pilar.
  useEffect(() => {
    if (!families || families.length === 0) return;
    let cancelled = false;
    setSlides(null);
    setCurrentSlide(0);

    Promise.all(
      families.map((f) =>
        getDishDuel({
          family: f.family,
          pillar: activePillar,
        }).catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      // Solo conservamos slides que tienen 2 contendientes o un fallback útil
      // para mostrar. Slides nulos (error de red) los descartamos.
      const valid: DishDuel[] = results.filter(
        (r): r is DishDuel => r !== null,
      );
      setSlides(valid);
    });

    return () => {
      cancelled = true;
    };
  }, [families, activePillar]);

  // Auto-advance del carrusel.
  useEffect(() => {
    if (!slides || slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides, paused]);

  const handleToggleWantToTry = useCallback(
    async (dishId: string, next: boolean) => {
      setSlides((prev) =>
        prev?.map((slide) => ({
          ...slide,
          items: slide.items.map((it) =>
            it.dishId === dishId ? { ...it, wantToTry: next } : it,
          ),
        })) ?? prev,
      );
      try {
        if (next) await addToWantToTry(dishId);
        else await removeFromWantToTry(dishId);
      } catch {
        setSlides((prev) =>
          prev?.map((slide) => ({
            ...slide,
            items: slide.items.map((it) =>
              it.dishId === dishId ? { ...it, wantToTry: !next } : it,
            ),
          })) ?? prev,
        );
        toast.error(
          next ? tErr('addFailed') : tErr('removeFailed'),
          tErr('tryAgain'),
        );
      }
    },
    [toast, tErr],
  );

  const handleFallbackRetry = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides]);

  const familyDisplayName = useCallback(
    (familySlug: string): string => {
      // Si la familia no está en el i18n dict, mostramos el slug capitalizado
      // como fallback (mejor que un missing-message warning).
      const key = `families.${familySlug}`;
      // next-intl tira si la key no existe; usamos try/catch para fallback.
      try {
        const v = t(key);
        if (v && v !== key) return v;
      } catch {
        // fallthrough
      }
      return capitalize(familySlug);
    },
    [t],
  );

  const titleText = t(`title.${activePillar}` as const);
  const winnerText = t(`winner.${activePillar}` as const);

  const activeSlide = useMemo<DishDuel | null>(() => {
    if (!slides || slides.length === 0) return null;
    return slides[currentSlide] ?? null;
  }, [slides, currentSlide]);

  // Errores duros (red, 5xx): silenciamos el rail.
  if (error) return null;
  // Sin familias activas en la DB — no hay nada para mostrar.
  if (families !== null && families.length === 0) return null;

  return (
    <div data-tour-id="dish_duel">
    <Rail
      kicker={t('kicker')}
      title={titleText}
      subtitle={t('subtitle')}
    >
      <PillarPills value={activePillar} onChange={setActivePillar} t={t} />

      <div
        className="relative overflow-hidden rounded-3xl border border-[color:var(--color-dorado)]/40 bg-surface-card p-4 shadow-sm md:p-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <ArenaBackground />
        <div className="relative">
        {slides === null || activeSlide === null ? (
          <DuelSkeleton />
        ) : (
          <>
            <SlideHeader
              familyName={
                activeSlide.family
                  ? familyDisplayName(activeSlide.family)
                  : ''
              }
              count={
                families?.find((f) => f.family === activeSlide.family)
                  ?.restaurantCount
              }
              suffix={t('rootSampleSuffix', {
                count:
                  families?.find((f) => f.family === activeSlide.family)
                    ?.restaurantCount ?? 0,
              })}
            />
            {isFallbackReason(activeSlide.fallbackReason) ? (
              <FallbackMessage
                familyName={
                  activeSlide.family
                    ? familyDisplayName(activeSlide.family)
                    : ''
                }
                restaurantName={
                  activeSlide.items[0]?.restaurantName ?? ''
                }
                onRetry={handleFallbackRetry}
                canRetry={(slides?.length ?? 0) > 1}
                titleTpl={t('fallbackUniqueRestaurant.title', {
                  familyName: activeSlide.family
                    ? familyDisplayName(activeSlide.family)
                    : '',
                  restaurantName:
                    activeSlide.items[0]?.restaurantName ?? '—',
                })}
                ctaLabel={t('fallbackUniqueRestaurant.cta')}
              />
            ) : activeSlide.items.length >= 2 ? (
              <DuelArena
                left={activeSlide.items[0]}
                right={activeSlide.items[1]}
                activePillar={activePillar}
                winnerText={winnerText}
                vsLabel={t('vs')}
                onToggleWantToTry={
                  enableWishlist ? handleToggleWantToTry : undefined
                }
              />
            ) : null}

            {slides && slides.length > 1 && (
              <CarouselDots
                count={slides.length}
                current={currentSlide}
                onSelect={setCurrentSlide}
                familyDisplayName={familyDisplayName}
                slides={slides}
              />
            )}
          </>
        )}
        </div>
      </div>
    </Rail>
    </div>
  );
}

/**
 * Capa decorativa del background del rail: dos spotlights radiales
 * (dorado a la izquierda = ganador, terracota a la derecha = contendiente)
 * + un glow central sutil que enmarca el VS divider. Llena el espacio
 * sobrante del rectángulo y refuerza visualmente la metáfora de "arena".
 *
 * Decorativo puro — `aria-hidden`, `pointer-events-none`. Vive debajo del
 * contenido vía `z-index` del padre (`relative` en el wrapper del contenido).
 */
function ArenaBackground() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl md:h-80 md:w-80"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-dorado), transparent 70%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-40 blur-3xl md:h-80 md:w-80"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-terracota-light), transparent 70%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl md:h-72 md:w-72"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-dorado-pale), transparent 70%)',
        }}
      />
    </>
  );
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isFallbackReason(
  reason: DishDuel['fallbackReason'],
): reason is 'family_unique_restaurant' | 'root_unique_restaurant' {
  return (
    reason === 'family_unique_restaurant' ||
    reason === 'root_unique_restaurant'
  );
}

function SlideHeader({
  familyName,
  count,
  suffix,
}: {
  familyName: string;
  count: number | undefined;
  suffix: string;
}) {
  if (!familyName) return null;
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-2">
      <h3 className="font-display text-lg font-semibold text-text-primary">
        {familyName}
      </h3>
      {count !== undefined && count > 0 && (
        <span className="font-sans text-xs text-text-muted">{suffix}</span>
      )}
    </div>
  );
}

function PillarPills({
  value,
  onChange,
  t,
}: {
  value: DuelPillar;
  onChange: (p: DuelPillar) => void;
  t: ReturnType<typeof useTranslations<'discovery.duel'>>;
}) {
  return (
    <div
      role="tablist"
      aria-label={t('pillarLabel')}
      className="flex flex-wrap gap-1.5 rounded-full border border-border-subtle bg-surface-subtle p-1"
    >
      {PILLARS.map((p) => {
        const active = p === value;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p)}
            className={
              active
                ? 'min-h-[44px] flex-1 rounded-full bg-[var(--color-terracota)] px-3 py-2 font-sans text-xs font-semibold text-text-inverse shadow transition-colors'
                : 'min-h-[44px] flex-1 rounded-full px-3 py-2 font-sans text-xs font-medium text-text-muted transition-colors hover:text-text-primary'
            }
          >
            {t(PILLAR_LABEL_KEY[p])}
          </button>
        );
      })}
    </div>
  );
}

function DuelArena({
  left,
  right,
  activePillar,
  winnerText,
  vsLabel,
  onToggleWantToTry,
}: {
  left: import('@/app/lib/types/social').DiscoveryDishItem;
  right: import('@/app/lib/types/social').DiscoveryDishItem;
  activePillar: DuelPillar;
  winnerText: string;
  vsLabel: string;
  onToggleWantToTry?: (dishId: string, next: boolean) => void;
}) {
  // Alineación: en mobile/tablet la card de 288px se centra en su cell
  // (`justify-self-center`). En desktop, cada card se acerca al VS divider
  // (izq `md:justify-self-end`, der `md:justify-self-start`) para que el
  // conjunto cards+VS quede visualmente centrado y simétrico.
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-2 lg:gap-4">
      <div className="relative justify-self-center md:justify-self-end">
        <span className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-[var(--color-dorado)] px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wider text-text-inverse shadow">
          {winnerText}
        </span>
        <DishDiscoveryCard
          dish={left}
          onToggleWantToTry={onToggleWantToTry}
          highlightedPillar={activePillar}
        />
      </div>
      <VsDivider label={vsLabel} />
      <div className="relative justify-self-center md:justify-self-start">
        <DishDiscoveryCard
          dish={right}
          onToggleWantToTry={onToggleWantToTry}
          highlightedPillar={activePillar}
        />
      </div>
    </div>
  );
}

function VsDivider({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      className="relative flex items-center justify-center md:px-1"
    >
      <span className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[color:var(--color-dorado)]/50 md:inset-x-auto md:inset-y-6 md:left-1/2 md:top-0 md:h-auto md:w-0 md:-translate-x-1/2 md:translate-y-0 md:border-l-2 md:border-t-0" />
      <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-dorado)] font-display text-sm font-bold text-text-inverse shadow-lg ring-4 ring-surface-card">
        {label}
      </span>
    </div>
  );
}

function FallbackMessage({
  titleTpl,
  ctaLabel,
  onRetry,
  canRetry,
}: {
  familyName: string;
  restaurantName: string;
  titleTpl: string;
  ctaLabel: string;
  onRetry: () => void;
  canRetry: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-3 px-3 py-6 text-text-primary md:items-center md:text-center">
      <p className="font-sans text-sm">{titleTpl}</p>
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] rounded-full bg-[var(--color-terracota)] px-4 py-2 font-sans text-sm font-semibold text-text-inverse shadow transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

function CarouselDots({
  count,
  current,
  onSelect,
  familyDisplayName,
  slides,
}: {
  count: number;
  current: number;
  onSelect: (i: number) => void;
  familyDisplayName: (slug: string) => string;
  slides: DishDuel[];
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === current;
        const label = slides[i]?.family
          ? familyDisplayName(slides[i].family!)
          : `Slide ${i + 1}`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={label}
            aria-current={active}
            className={
              active
                ? 'h-2.5 w-8 rounded-full bg-[var(--color-terracota)] transition-all'
                : 'h-2.5 w-2.5 rounded-full bg-border-default transition-all hover:bg-text-muted'
            }
          />
        );
      })}
    </div>
  );
}

function DuelSkeleton() {
  return (
    <div
      className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]"
      aria-busy="true"
    >
      <div className="h-72 animate-pulse rounded-2xl border border-border-subtle bg-surface-card" />
      <div
        aria-hidden
        className="flex items-center justify-center md:px-1"
      >
        <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-border-subtle" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-border-subtle bg-surface-card" />
    </div>
  );
}
