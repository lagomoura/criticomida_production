---
name: Sprint 1+2 home aplicados (2026-05-08)
description: Cambios de identidad visual y WOW aplicados en Sprint 1+2 sobre la home pública
type: project
---

Cambios aplicados el 2026-05-08 en sprint 1 (críticos/altos identidad) + sprint 2 (DMMT + WOW FeedWelcome + empty state Siguiendo). No commitados todavía — usuario revisa diff primero.

**Archivos modificados:**
- `app/components/feed/FeedWelcome.tsx` — CTA anónimo: size md→lg, flex-col mobile (w-full), ghost→outline en login, tips degradados a text-xs/muted
- `app/components/feed/discovery/DishDuelRail.tsx` — bg-emerald-500→var(--color-albahaca) badge Ganador; bg-white→bg-surface-card en select
- `app/components/feed/discovery/TrendingRail.tsx` — bg-white→bg-surface-card en select; emoji ★/❤ raw→aria-hidden spans; scrollLabel pasado a HorizontalScroll
- `app/components/feed/discovery/DishDiscoveryCard.tsx` — text-white→text-text-inverse en GeekScore badge; labels pilares hardcodeadas→i18n
- `app/components/feed/discovery/HorizontalScroll.tsx` — role=region (condicional, solo cuando ariaLabel presente) + ariaLabel prop + fade gradient derecho
- `messages/{es,en,pt}.json` — feed.kicker actualizado; followingEmpty.title+action; feed.welcome.tipsLabel; discovery.trending.scrollLabel

**Decisiones de implementación registradas:**
- role="region" en HorizontalScroll es CONDICIONAL (solo activo cuando ariaLabel presente) — sin ariaLabel un role=region sin label viola WCAG
- Los tips del FeedWelcome pasaron de Cormorant display a DM Sans xs/muted — jerarquía visual: CTAs son el hero, tips son contexto
- ghost→outline para el botón de login: ghost sobre superficie card era de bajo contraste; outline es más legible y mantiene jerarquía (primary > outline)
- json.dump en Python reformateó arrays de presets a multilínea — es ruido de formato preexistente, sin cambio de contenido

**Why:** Usuario aprobó Sprint 1 + Sprint 2 en la sesión del 2026-05-08. Sprint 3 (GeoCTA y DishDiscoveryCard fallback SVG) quedó para próximo pase.

**How to apply:** No re-flagear estos hallazgos como nuevos en audits futuros. Sprint 3 pendiente para próximo pase cuando el usuario lo apruebe.
