'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faPenToSquare,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import type { SommelierPreview } from '@/app/lib/api/chat';

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
