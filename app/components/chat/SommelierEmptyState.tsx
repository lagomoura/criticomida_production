'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faPenToSquare,
  faTriangleExclamation,
  faChevronRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import {
  dismissPendingRecall,
  type SommelierPreview,
  type SommelierPreviewPendingRecall,
} from '@/app/lib/api/chat';

/**
 * Empty state for the Sommelier chat drawer.
 *
 * Three branches share the same shell:
 *
 * 1. **Logged-in with profile** (preview.user && preview.profile)
 *    — renders the "Te conocemos así" chip with the dominant pillar,
 *    favourite category/neighborhood and declared allergies, plus
 *    starter chips that incorporate those signals
 *    ("Una ganga rica en {top_neighborhood}", "Una ruta de 3 platos
 *    en {top_neighborhood}"). The point of this branch is that the
 *    comensal *sees* the bot already knows them — that's the WOW
 *    moment Phase 4 of the roadmap is targeting.
 *
 * 2. **Logged-in without profile** (preview.user, profile=null) —
 *    name greeting + generic starters, no profile chip. Once the
 *    user has reviewed enough dishes the aggregator populates the
 *    profile automatically and they upgrade to branch 1 next time.
 *
 * 3. **Anonymous** (preview.user=null) — sign-in invitation + same
 *    generic starters. We never block the chat for anonymous; the
 *    invitation is a soft nudge.
 *
 * All starter messages are i18n keys so the click sends a phrase in
 * the user's locale; that keeps the agent's response language consistent
 * with the user's chosen locale (Regla de idioma del prompt).
 */
interface Props {
  preview: SommelierPreview | null;
  onSendStarter: (message: string) => void;
  disabled?: boolean;
  /** Fired synchronously when the comensal clicks a navigation link
   *  inside the empty state (e.g. "Editar mis gustos"). The drawer
   *  is rendered as an overlay above the page; without closing it
   *  on click, the destination route renders behind the open drawer
   *  and the user has to dismiss the chat manually before reaching
   *  it. */
  onCloseDrawer?: () => void;
}

type DynamicStarter = { key: string; label: string; message: string };

function pickDynamicStarters(
  preview: SommelierPreview | null,
  t: (key: string, vars?: Record<string, string>) => string,
): DynamicStarter[] {
  const profile = preview?.profile ?? null;
  const topNeighborhood = profile?.top_neighborhoods?.[0];

  // Profile-aware starters live first; we keep at most three so the
  // chip row stays readable on a 360px-wide phone.
  const starters: DynamicStarter[] = [];

  if (topNeighborhood) {
    starters.push({
      key: 'gangaInNeighborhood',
      label: t('starters.gangaInNeighborhood.label', {
        neighborhood: topNeighborhood,
      }),
      message: t('starters.gangaInNeighborhood.message', {
        neighborhood: topNeighborhood,
      }),
    });
    starters.push({
      key: 'routeInNeighborhood',
      label: t('starters.routeInNeighborhood.label', {
        neighborhood: topNeighborhood,
      }),
      message: t('starters.routeInNeighborhood.message', {
        neighborhood: topNeighborhood,
      }),
    });
  } else {
    // No profile data → fall back to the same generic starters anon
    // visitors see, so the layout doesn't shift between branches.
    starters.push({
      key: 'greatDeal',
      label: t('starters.greatDeal.label'),
      message: t('starters.greatDeal.message'),
    });
    starters.push({
      key: 'firstDate',
      label: t('starters.firstDate.label'),
      message: t('starters.firstDate.message'),
    });
  }

  // Always-on third chip: a mood-driven prompt that gives the agent
  // an excuse to flex semantic_query without forcing a filter.
  starters.push({
    key: 'surprise',
    label: t('starters.surprise.label'),
    message: t('starters.surprise.message'),
  });

  return starters;
}

export default function SommelierEmptyState({
  preview,
  onSendStarter,
  disabled = false,
  onCloseDrawer,
}: Props) {
  const t = useTranslations('chat.sommelierEmpty');
  const locale = useLocale();
  const user = preview?.user ?? null;
  const profile = preview?.profile ?? null;

  const starters = pickDynamicStarters(preview, t);

  // Build the "Te conocemos así" chip body. The pillar label only
  // ships pre-translated for locale=es; for en/pt we look up our
  // own translation table keyed off the enum value.
  const pillarText = profile?.dominant_pillar
    ? locale === 'es' && profile.dominant_pillar_label
      ? profile.dominant_pillar_label
      : t(`pillars.${profile.dominant_pillar}`)
    : null;

  // First top category/neighborhood pair, kept short so the chip
  // never wraps to three lines on a phone.
  const topCategory = profile?.top_categories?.[0] ?? null;
  const topNeighborhood = profile?.top_neighborhoods?.[0] ?? null;
  const allergies = profile?.allergies ?? [];
  const pendingRecalls = preview?.pending_recalls ?? [];

  // Local dismissals are tracked client-side so the "X" tap removes
  // the card instantly without waiting for the round-trip; the POST
  // runs in the background and the backend idempotency makes a retry
  // (or a stale state from a re-fetch) harmless. We keep the set
  // additive within the component lifetime — it resets when the
  // drawer remounts, which is the natural moment to re-fetch the
  // server-side truth anyway.
  const [dismissedDishIds, setDismissedDishIds] = useState<Set<string>>(
    () => new Set(),
  );
  const handleDismiss = useCallback((dishId: string) => {
    setDismissedDishIds((prev) => {
      if (prev.has(dishId)) return prev;
      const next = new Set(prev);
      next.add(dishId);
      return next;
    });
    void dismissPendingRecall(dishId).catch(() => {
      // Eventual consistency: the next drawer-open will reconcile
      // by re-fetching the preview. Swallowing the error keeps the
      // empty state quiet — a failed dismiss is low-stakes UX-wise.
    });
  }, []);
  const visibleRecalls = pendingRecalls.filter(
    (r) => !dismissedDishIds.has(r.dish_id),
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      {/* Icon mark — keeps visual continuity with the Business empty
          state (icon → headline → starters). */}
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-action-primary/10">
        <FontAwesomeIcon
          icon={faUtensils}
          className="h-7 w-7 text-action-primary"
          aria-hidden="true"
        />
      </span>

      {/* Greeting — adapts to the auth/profile branch. */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-display text-2xl text-text-primary">
          {user
            ? t('greetingNamed', { name: user.display_name })
            : t('greetingAnon')}
        </h2>
        <p className="text-sm text-text-muted">{t('subtitle')}</p>
      </div>

      {/* Post-visit Bridge (B) — dishes the Sommelier recommended in
          the last 14 days and the diner hasn't reviewed yet. Lives
          above the profile chip because closing the loop on a
          recommendation is the most actionable thing the empty state
          can offer; the profile chip is identity, not action. Each
          card navigates to /compose?dish_id=X — same destination as
          the D2 push notification, so the two surfaces stay coherent. */}
      {visibleRecalls.length > 0 && (
        <section
          aria-labelledby="sommelier-pending-recalls-heading"
          className="flex w-full max-w-[28rem] flex-col gap-2"
        >
          <p
            id="sommelier-pending-recalls-heading"
            className="text-xs uppercase tracking-wider text-action-highlight"
          >
            {t('pendingRecalls.heading')}
          </p>
          <ul className="flex flex-col gap-2">
            {visibleRecalls.map((recall) => (
              <PendingRecallCard
                key={recall.dish_id}
                recall={recall}
                locale={locale}
                onNavigate={() => onCloseDrawer?.()}
                onDismiss={handleDismiss}
                ctaLabel={t('pendingRecalls.cta')}
                dismissLabel={t('pendingRecalls.dismiss')}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Profile chip — only when the comensal has a populated profile. */}
      {profile && (pillarText || topCategory || topNeighborhood || allergies.length > 0) && (
        <div className="flex max-w-[28rem] flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-action-primary/5 px-4 py-3">
          <span className="text-xs uppercase tracking-wider text-action-primary">
            {t('profileChip.label')}
          </span>
          <p className="font-display text-sm text-text-primary">
            {[
              pillarText && t('profileChip.pillarFragment', { pillar: pillarText }),
              topCategory && t('profileChip.categoryFragment', { category: topCategory }),
              topNeighborhood && t('profileChip.neighborhoodFragment', { neighborhood: topNeighborhood }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {allergies.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-action-danger/10 px-2.5 py-1 text-xs text-action-danger">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="h-3 w-3"
                aria-hidden="true"
              />
              {t('profileChip.allergiesFragment', {
                allergies: allergies.join(', '),
              })}
            </span>
          )}
        </div>
      )}

      {/* Sign-in invitation — only when the comensal is anonymous.
          Soft nudge: the chat works fine without login, but the
          recall + personalisation only kicks in if we know who they are. */}
      {!user && (
        <p className="max-w-[24rem] text-sm text-text-muted">
          {t('anonInvite')}
        </p>
      )}

      {/* Starter chips — three at most so the row never wraps to
          three lines on a 360px phone. */}
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-wider text-text-muted">
          {t('startersHeading')}
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {starters.map((starter) => (
            <li key={starter.key}>
              <button
                type="button"
                onClick={() => onSendStarter(starter.message)}
                disabled={disabled}
                className="rounded-full border border-border-default bg-surface-card px-3.5 py-1.5 text-sm text-text-primary transition hover:border-action-primary hover:text-action-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {starter.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer link — only when the comensal has a profile. Routes
          to ``/me/preferencias`` (Fase 7), the dedicated B2C
          settings page that lets the user edit allergies +
          preferred hours and tune chat language/style. The onClick
          fires the drawer close so the destination doesn't render
          behind an open chat overlay. */}
      {user && profile && (
        <Link
          href={`/${locale}/me/preferencias`}
          onClick={() => onCloseDrawer?.()}
          className="inline-flex items-center gap-1.5 text-xs text-action-primary hover:underline"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" aria-hidden="true" />
          {t('profileChip.editCta')}
        </Link>
      )}
    </div>
  );
}

interface PendingRecallCardProps {
  recall: SommelierPreviewPendingRecall;
  locale: string;
  onNavigate: () => void;
  onDismiss: (dishId: string) => void;
  ctaLabel: string;
  dismissLabel: string;
}

/**
 * Compact card surfaced inside the Sommelier empty state for the
 * Post-visit Bridge (B). One per dish the agent recommended in the
 * last 14 days that the diner hasn't reviewed yet. Click navigates
 * to the compose form pre-filled with the dish; the "X" in the
 * top-right corner dismisses the card permanently.
 *
 * Layout is full-width inside the section (not horizontal scroll)
 * because we cap at 3 items; vertical stack reads better on a 360px
 * phone than a tight horizontal carousel.
 *
 * The dismiss button sits as a sibling of the ``Link`` (not nested
 * inside it) because an interactive button inside an anchor breaks
 * a11y semantics. ``stopPropagation`` on the click keeps the dismiss
 * from triggering the surrounding navigation handler when the user
 * actually wants to remove the card.
 */
function PendingRecallCard({
  recall,
  locale,
  onNavigate,
  onDismiss,
  ctaLabel,
  dismissLabel,
}: PendingRecallCardProps) {
  // The row is a flex container holding three slots: a primary Link
  // (thumb + texts) that takes the navigation tap, an explicit
  // dismiss button, and a decorative chevron. Border + bg live on
  // the outer ``<li>`` so the whole row feels like one card while
  // the interactive surfaces (Link, button) stay semantically
  // distinct — interactive elements nested inside an anchor would
  // break a11y, so the dismiss button is a sibling of the Link.
  //
  // The chevron is purely visual now (``aria-hidden`` +
  // ``pointer-events-none``): its only job is to telegraph "this row
  // navigates somewhere". The Link covers everything to its left,
  // so a tap anywhere outside the X still routes to /compose.
  return (
    <li className="group relative flex items-center gap-1.5 rounded-2xl border border-border-subtle bg-surface-card pr-3 transition hover:border-action-highlight">
      <Link
        href={`/${locale}/compose?dish_id=${recall.dish_id}`}
        onClick={onNavigate}
        aria-label={ctaLabel}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-left focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        {/* Thumbnail. Always reserves the square so the row height
            stays stable whether or not the dish has a cover image. */}
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-action-highlight/10">
          {recall.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recall.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <FontAwesomeIcon
              icon={faUtensils}
              className="h-5 w-5 text-action-highlight"
              aria-hidden="true"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-sans text-sm font-medium text-text-primary">
            {recall.dish_name}
          </span>
          <span className="truncate font-sans text-xs text-text-muted">
            {recall.restaurant_name}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDismiss(recall.dish_id);
        }}
        aria-label={dismissLabel}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-action-danger/10 hover:text-action-danger focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <FontAwesomeIcon icon={faXmark} className="h-3 w-3" aria-hidden="true" />
      </button>
      <FontAwesomeIcon
        icon={faChevronRight}
        className="h-3 w-3 shrink-0 text-text-muted transition group-hover:text-action-highlight pointer-events-none"
        aria-hidden="true"
      />
    </li>
  );
}
