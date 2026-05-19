---
name: project_profile_stats_instagram
description: Rediseño de stats de perfil /u/[userId] al patrón Instagram — barra 3 columnas + tira de reputación. Aprobado y aplicado 2026-05-17.
metadata:
  type: project
---

Barra de stats del perfil público rediseñada al patrón Instagram (2026-05-17).

**Decisiones aprobadas:**

1. **Barra 3 columnas** (Reseñas · Seguidores · Seguidos): `grid grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle`. Las 3 siempre son `<button>` con `min-h-[44px]`, `hover:bg-surface-subtle/60`, `active:bg-surface-subtle`, `focus-visible:[box-shadow:var(--focus-ring)]`. Número arriba (Cormorant `text-2xl` `text-text-primary`), label abajo (`font-sans text-[11px] uppercase tracking-[0.14em] text-text-muted`).

2. **Reseñas → smooth-scroll**: prop `onOpenReviews?(userId)` en ProfileHeaderProps. Handler en PublicProfileClient.tsx usa `window.matchMedia('(prefers-reduced-motion: reduce)')` para elegir `'smooth'` vs `'auto'`. Sección target tiene `id="user-reviews"` + `scroll-mt-20`.

3. **Tira de reputación**: componente `ReputationStrip` separado, renderizado condicionalmente entre la barra y `SpecialtySection`. Reutiliza el lenguaje visual de `CategoryChip` (misma border/bg terracota tintada). Verifiedcount con `faCircleCheck` + Tooltip (claves existentes `expertTooltipLead/Body`). Venues con `faUtensils`. CONTRASTE: `text-text-primary` sobre fondo terracota/8 → WCAG AA.

4. **Claves i18n**: se reusaron `statReviews/statFollowers/statFollowing/statExperts/statVenues` sin agregar nuevas. No había necesidad de wording adicional.

5. **Stat simplificado**: borrada la rama `<div>` no-clickeable y la prop `accent` (ya no se usa). El componente siempre renderiza `<button>`; si no hay `onClick`, `disabled={true}` y `cursor-default`.

**Why:** El `flex-wrap` previo wrapeaba feo a 360px, y solo Seguidores/Seguidos eran `<button>` sin señal visual → violación DMMT de affordance visible. Las métricas de reputación (Expertas/Locales) mezcladas con métricas sociales confundían el patrón Instagram.

**How to apply:** En futuras sesiones sobre ProfileHeader, no re-flaguear el wrap de stats (ya resuelto). La tira de reputación es el hogar correcto de verifiedReviewCount y restaurantsVisited. Si hay nuevas métricas de reputación, van a ReputationStrip, no a la barra de 3 columnas.
