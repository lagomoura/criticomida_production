'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faEllipsisVertical,
  faRightFromBracket,
  faShieldHalved,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import MasteryBadge from '@/app/components/ui/MasteryBadge';
import Tooltip from '@/app/components/ui/Tooltip';
import FollowButton from './FollowButton';
import type {
  CategoryStat,
  FeaturedTitle,
  MasteryLevel,
  PublicUserProfile,
} from '@/app/lib/types/social';

export interface ProfileHeaderProps {
  profile: PublicUserProfile;
  followLoading?: boolean;
  onFollowToggle?: (userId: string, next: boolean) => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  logoutLoading?: boolean;
  onOpenFollowers?: (userId: string) => void;
  onOpenFollowing?: (userId: string) => void;
  /**
   * Scroll suave a la sección de reseñas del propio perfil.
   * Misma convención que onOpenFollowers/onOpenFollowing.
   */
  onOpenReviews?: (userId: string) => void;
  /**
   * Abre el menú "⋯" en el header (Reportar / Silenciar / Bloquear).
   * Solo se renderiza el botón cuando el viewer está logueado Y no es su
   * propio perfil; eso lo decide el caller con esta prop.
   */
  onOpenMenu?: (userId: string) => void;
}

export default function ProfileHeader({
  profile,
  followLoading = false,
  onFollowToggle,
  onEditProfile,
  onLogout,
  logoutLoading = false,
  onOpenFollowers,
  onOpenFollowing,
  onOpenReviews,
  onOpenMenu,
}: ProfileHeaderProps) {
  const t = useTranslations('profile.header');
  const tSpec = useTranslations('profile.specialty');
  const locale = useLocale();
  const { isSelf, following } = profile.viewerState;
  const kicker = isSelf ? t('kickerSelf') : t('kickerOther');
  const [bioExpanded, setBioExpanded] = useState(false);

  return (
    <header className="flex flex-col gap-6 border-b border-border-subtle pb-6">
      <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-action-primary">
        {kicker}
      </p>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-7">
        <Avatar
          src={profile.avatarUrl}
          name={profile.displayName}
          size="xl"
          className="ring-2 ring-surface-card shadow-[var(--shadow-base)]"
        />
        <div className="min-w-0 flex-1">
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] text-text-primary">
            {profile.displayName}
          </h1>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-sans text-sm text-text-muted">
            {profile.handle && <span>@{profile.handle}</span>}
            {profile.handle && profile.location && (
              <span aria-hidden className="opacity-60">·</span>
            )}
            {profile.location && <span>{profile.location}</span>}
          </div>
          {profile.reputation?.featuredTitle && (
            <div className="mt-2.5">
              <FeaturedTitleBadge
                featured={profile.reputation.featuredTitle}
                categories={profile.reputation.topCategories}
              />
            </div>
          )}
        </div>
      </div>

      {profile.bio && (
        <div className="max-w-2xl">
          <p
            className={[
              // Inter para body de bio: legibilidad sobre display.
              // Cormorant italic en párrafo largo (3+ líneas) degrada
              // la lectura (brand-identity-v2.md §3.4: italic reservado
              // para nombres de platos en reviews y taglines de marca).
              'whitespace-pre-wrap font-sans text-base leading-relaxed text-text-secondary sm:text-lg',
              !bioExpanded ? 'line-clamp-3' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {profile.bio}
          </p>
          {/* Only render toggle if bio is long enough to actually clamp */}
          {profile.bio.length > 120 && (
            <button
              type="button"
              onClick={() => setBioExpanded((v) => !v)}
              className="mt-1 inline-flex min-h-[44px] items-center font-sans text-xs font-semibold text-action-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {bioExpanded ? t('bioSeeLess') : t('bioSeeMore')}
            </button>
          )}
        </div>
      )}

      {/* ── Barra de stats estilo Instagram: 3 columnas iguales, siempre una fila.
           No es <dl>: son botones de navegación, no una lista de definiciones.
           El nombre accesible va por aria-label en cada <button>. ── */}
      <div className="grid grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle">
        <Stat
          label={t('statReviews')}
          value={profile.counts.reviews}
          locale={locale}
          onClick={onOpenReviews ? () => onOpenReviews(profile.id) : undefined}
        />
        <Stat
          label={t('statFollowers')}
          value={profile.counts.followers}
          locale={locale}
          onClick={onOpenFollowers ? () => onOpenFollowers(profile.id) : undefined}
        />
        <Stat
          label={t('statFollowing')}
          value={profile.counts.following}
          locale={locale}
          onClick={onOpenFollowing ? () => onOpenFollowing(profile.id) : undefined}
        />
      </div>

      {/* ── Tira de reputación: solo si hay datos, ubicada antes de Especialidades ── */}
      {profile.reputation &&
        (profile.reputation.verifiedReviewCount > 0 ||
          profile.reputation.restaurantsVisited > 0) && (
          <ReputationStrip
            verifiedCount={profile.reputation.verifiedReviewCount}
            venuesCount={profile.reputation.restaurantsVisited}
            expertLabel={t('statExperts')}
            venuesLabel={t('statVenues')}
            tooltipLead={t('expertTooltipLead')}
            tooltipBody={t('expertTooltipBody')}
          />
        )}

      {profile.reputation && profile.reputation.topCategories.length > 0 && (
        <SpecialtySection categories={profile.reputation.topCategories} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isSelf ? (
          <>
            <Button variant="outline" size="md" onClick={onEditProfile}>
              {t('editProfile')}
            </Button>
            <Link
              href="/me/privacidad"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border-default px-3 py-2 font-sans text-sm font-medium text-text-primary no-underline transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" aria-hidden />
              {t('privacy')}
            </Link>
            {onLogout && (
              <span className="ml-1 border-l border-border-subtle pl-3">
                <button
                  type="button"
                  disabled={logoutLoading}
                  onClick={onLogout}
                  aria-busy={logoutLoading || undefined}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2 font-sans text-xs font-medium text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  {logoutLoading ? (
                    <span aria-hidden className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FontAwesomeIcon icon={faRightFromBracket} className="h-3 w-3" aria-hidden />
                  )}
                  {t('logout')}
                </button>
              </span>
            )}
          </>
        ) : onFollowToggle ? (
          <>
            <FollowButton
              userId={profile.id}
              following={following}
              loading={followLoading}
              onToggle={onFollowToggle}
            />
            {onOpenMenu && (
              <button
                type="button"
                onClick={() => onOpenMenu(profile.id)}
                aria-label={t('moreOptions')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
              </button>
            )}
          </>
        ) : null}
      </div>
    </header>
  );

  function SpecialtySection({ categories }: { categories: CategoryStat[] }) {
    const groups = new Map<MasteryLevel | null, CategoryStat[]>();
    for (const cat of categories) {
      const key = cat.masteryLevel ?? null;
      const arr = groups.get(key);
      if (arr) arr.push(cat);
      else groups.set(key, [cat]);
    }
    const visibleGroups = LEVEL_ORDER.flatMap((level) => {
      const items = groups.get(level);
      return items && items.length > 0 ? [{ level, items }] : [];
    });

    return (
      <div className="flex flex-col gap-2">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          {t('specialtyHeading')}
        </p>
        <div className="flex flex-col gap-2">
          {visibleGroups.map(({ level, items }) => (
            <div
              key={level ?? 'unranked'}
              className="flex flex-wrap items-center gap-2"
            >
              {level && (
                <MasteryBadge level={level} variant="compact" className="shrink-0" />
              )}
              {items.map((cat) => (
                <CategoryChip key={cat.name} cat={cat} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function FeaturedTitleBadge({
    featured,
    categories,
  }: {
    featured: FeaturedTitle;
    categories: CategoryStat[];
  }) {
    const cat = categories.find((c) => c.name === featured.category);
    if (!cat) {
      return <MasteryBadge level={featured.level} category={featured.category} />;
    }

    return (
      <Tooltip
        multiline
        label={
          <>
            <strong className="font-semibold">{specialtyHeadline(cat, tSpec)}</strong>{' '}
            {t('averageWord')}{' '}
            <span className="font-semibold tabular-nums">
              {cat.avgRating.toFixed(1)}
            </span>{' '}
            — {specialtyTone(cat.avgRating, tSpec)}
          </>
        }
      >
        <span tabIndex={0} className="inline-block cursor-help">
          <MasteryBadge level={featured.level} category={featured.category} />
        </span>
      </Tooltip>
    );
  }

  function CategoryChip({ cat }: { cat: CategoryStat }) {
    return (
      <Tooltip
        multiline
        label={
          <>
            <strong className="font-semibold">{specialtyHeadline(cat, tSpec)}</strong>{' '}
            {t('averageWord')}{' '}
            <span className="font-semibold tabular-nums">
              {cat.avgRating.toFixed(1)}
            </span>{' '}
            — {specialtyTone(cat.avgRating, tSpec)}
          </>
        }
      >
        <span
          tabIndex={0}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-terracota)]/30 bg-[color:var(--color-terracota)]/8 px-3 py-1 font-sans text-xs font-medium text-text-primary"
        >
          <FontAwesomeIcon
            icon={faUtensils}
            className="text-[10px] text-[color:var(--color-terracota)]"
            aria-hidden
          />
          <span>{cat.name}</span>
          <span className="font-display text-xs font-semibold text-[color:var(--color-terracota)] tabular-nums">
            {cat.avgRating.toFixed(1)}
          </span>
        </span>
      </Tooltip>
    );
  }
}

/**
 * Stat — columna de la barra de stats estilo Instagram.
 * Siempre es un <button> (las 3 columnas tienen onClick).
 * Layout columna: número arriba (Cormorant), label abajo (DM Sans caps).
 * Tap target mínimo 44px garantizado por min-h-[44px].
 */
function Stat({
  label,
  value,
  locale,
  onClick,
}: {
  label: string;
  value: number;
  locale: string;
  onClick?: () => void;
}) {
  const formatted = formatStatCount(value, locale);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${formatted} ${label}`}
      className={[
        'flex w-full flex-col items-center justify-center gap-0.5 py-3',
        'min-h-[44px] transition-colors',
        onClick
          ? 'cursor-pointer hover:bg-surface-subtle/60 active:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]'
          : 'cursor-default',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="font-display text-2xl font-medium tabular-nums text-text-primary"
      >
        {formatted}
      </span>
      <span
        aria-hidden
        className="font-sans text-[11px] uppercase tracking-[0.14em] text-text-muted"
      >
        {label}
      </span>
    </button>
  );
}

/**
 * Formatea un contador de stat. Bajo 10.000 usa separador de miles del
 * locale ("1.234"); a partir de 10.000 usa notación compacta ("12 mil",
 * "1,2 M") para que el número no rompa el ancho de la columna en mobile.
 */
function formatStatCount(value: number, locale: string): string {
  if (value < 10_000) {
    return new Intl.NumberFormat(locale).format(value);
  }
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * ReputationStrip — tira de credibilidad de reputación.
 * Muestra "verificadas" (con tooltip) y "locales" como chips de marca,
 * reaprovechando el lenguaje visual de CategoryChip.
 * Solo se renderiza cuando hay al menos un dato positivo.
 * CONTRASTE: texto text-text-primary/espresso sobre tinte terracota-pale → WCAG AA.
 */
function ReputationStrip({
  verifiedCount,
  venuesCount,
  expertLabel,
  venuesLabel,
  tooltipLead,
  tooltipBody,
}: {
  verifiedCount: number;
  venuesCount: number;
  expertLabel: string;
  venuesLabel: string;
  tooltipLead: string;
  tooltipBody: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {verifiedCount > 0 && (
        <Tooltip
          multiline
          portal
          label={
            <>
              <strong className="font-semibold">{tooltipLead}</strong>{' '}
              {tooltipBody}
            </>
          }
        >
          <span
            tabIndex={0}
            className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-[color:var(--color-terracota)]/30 bg-[color:var(--color-terracota)]/8 px-3 py-1 font-sans text-xs font-medium text-text-primary"
          >
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="text-[12px] text-[color:var(--color-terracota)]"
              aria-hidden
            />
            <span className="font-display text-xs font-semibold tabular-nums text-text-primary">
              {verifiedCount}
            </span>
            <span>{expertLabel}</span>
          </span>
        </Tooltip>
      )}
      {venuesCount > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-terracota)]/30 bg-[color:var(--color-terracota)]/8 px-3 py-1 font-sans text-xs font-medium text-text-primary">
          <FontAwesomeIcon
            icon={faUtensils}
            className="text-[10px] text-[color:var(--color-terracota)]"
            aria-hidden
          />
          <span className="font-display text-xs font-semibold tabular-nums text-text-primary">
            {venuesCount}
          </span>
          <span>{venuesLabel}</span>
        </span>
      )}
    </div>
  );
}

const LEVEL_ORDER: Array<MasteryLevel | null> = [
  'master',
  'sommelier',
  'apprentice',
  null,
];

type SpecialtyT = ReturnType<typeof useTranslations<'profile.specialty'>>;

function specialtyHeadline(cat: CategoryStat, t: SpecialtyT): string {
  const { name, masteryLevel, reviewCount } = cat;
  switch (masteryLevel) {
    case 'master':
      return t('masterHeadline', { name, count: reviewCount });
    case 'sommelier':
      return t('sommelierHeadline', { name, count: reviewCount });
    case 'apprentice':
      return t('apprenticeHeadline', { name, count: reviewCount });
    default:
      return reviewCount >= 5
        ? t('curiousHeadline', { name, count: reviewCount })
        : t('noseHeadline', { name, count: reviewCount });
  }
}

function specialtyTone(avg: number, t: SpecialtyT): string {
  if (avg >= 4.5) return t('tonePremiumGenerous');
  if (avg >= 4.0) return t('toneSelective');
  if (avg >= 3.5) return t('toneBalanced');
  if (avg >= 3.0) return t('toneHonest');
  return t('toneRelentless');
}
