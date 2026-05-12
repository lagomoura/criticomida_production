---
name: Drift visual conocido en home (audit 2026-05-08) — estado post Sprint 1+2
description: Hallazgos del audit de home — estado actualizado post-implementación Sprint 1+2
type: project
---

Audit realizado el 2026-05-08. Sprint 1+2 aplicados en la misma sesión. Estado actualizado:

**CERRADOS (Sprint 1+2):**
- DishDuelRail.tsx — `bg-emerald-500` → `bg-[color:var(--color-albahaca)]`. RESUELTO.
- DishDiscoveryCard.tsx — `text-white` en badge Geek Score → `text-text-inverse`. RESUELTO.
- DishDiscoveryCard.tsx — Labels de pilares hardcodeadas en español → i18n via t(). RESUELTO.
- DishDuelRail.tsx y TrendingRail.tsx — `bg-white` en selects → `bg-surface-card`. RESUELTO.
- FeedClient.tsx — Kicker "El feed" → copy orientador trilingüe. RESUELTO.
- FeedWelcome.tsx — Panel de tips con demasiado peso visual → degradado a rol secundario. RESUELTO.
- HorizontalScroll.tsx — Sin role/aria-label ni indicador visual de scroll → role=region (condicional) + fade gradient. RESUELTO.
- TrendingRail.tsx — Emoji raw en DOM → aria-hidden spans. RESUELTO.
- feed.followingEmpty — Empty state "Siguiendo" con copy mejorado + CTA "Buscar críticos". RESUELTO.

**PENDIENTES (Sprint 3 — diferidos por usuario):**
- DishDiscoveryCard.tsx — Sin `snap-start` en el artículo propio (solo TrendingMiniCard tiene snap-start).
- FeedList.tsx:157 — "Llegaste al final del feed." puede elevarse a momento editorial.
- GeoCTA — denied por usuario en esta sesión, queda para próximo pase.
- DishDiscoveryCard fallback SVG (cuando no hay foto) — queda para próximo pase.

**Why:** Estos hallazgos del Sprint 3 no fueron aprobados para corrección en esta sesión.

**How to apply:** No re-flagear los cerrados. Al auditar de nuevo, verificar si el usuario quiere atacar Sprint 3.
