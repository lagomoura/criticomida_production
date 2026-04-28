---
name: Dish Profile Page v2 (página estrella v2)
description: Estado de /dishes/[id] tras shipping de v2 enriquecido — endpoints, componentes, decisiones clave
type: project
originSessionId: 1cffe77f-f674-4e78-9f98-be4014eaf0ac
---
Shipped 2026-04-27: `/dishes/[id]` se rediseñó como **página estrella** espejo de restaurants v2 — Server Component async + tabs sticky + agregados + editorial blurb generado por Claude.

**Why:** el plato es la entidad primaria del proyecto (sin platos no hay reviews, sin reviews no hay feed). Antes la página era hero + 3 stats + lista de PostCard. Ahora compite en densidad informativa con la página de restaurante.

**How to apply:** al planear cambios en dishes:
- Página principal `app/dishes/[id]/page.tsx` (async Server Component, fetch paralelo `Promise.allSettled`).
- Cliente raíz `app/dishes/[id]/components/DishPageClient.tsx` con tabs URL-synced (`?tab=`): `resumen`, `resenas`, `fotos`, `restaurante`.
- Hero `DishHeroV2.tsx` (Server) con badges de plato firma / categoría / price tier / rating dual CritiComida+restaurant.
- El cliente legacy `DishDetailClient.tsx` fue **eliminado** — el Server Component es la fuente única.

**Endpoints backend nuevos** (`backend/app/routers/dishes_social.py`):
- `GET /api/social/dishes/{id}` — enriquecido con `description`, `restaurant_*` (cover, lat/lon, rating CritiComida+Google), `is_signature`, `editorial_blurb`, `editorial_source`, `created_by_display_name`, `cuisine_types`.
- `GET /api/social/dishes/{id}/aggregates` · `GET .../photos` · `GET .../diary-stats` · `GET .../related` · `GET .../editorial-blurb` (204 si no hay) · `POST .../refresh-editorial` (admin/critic)

**Migration aplicada**: `015_dish_editorial_enrichment.py` — añade `editorial_blurb`, `editorial_blurb_lang`, `editorial_blurb_source`, `editorial_cached_at` a `dishes`.

**Editorial blurb (Claude)**: `backend/app/services/dish_editorial_enricher.py` usa `litellm` con modelo `anthropic/claude-haiku-4-5-20251001`. Lazy via `BackgroundTasks` en GET detail. System prompt cacheado (ephemeral). Degrada silencioso sin `EDITORIAL_API_KEY`/`CHAT_API_KEY`/`ANTHROPIC_API_KEY`. El backend de dev ya tenía `CHAT_API_KEY` y los blurbs se generan en el primer hit.

**Related dishes**: ILIKE token-level sobre `Dish.name` (excluye self restaurant, prefiere misma `restaurant.city`). En `dish_service.get_related_dishes`. Para escala >10k dishes, migrar a tsvector / pg_trgm.

**Archivos clave a recordar**:
- Server: `app/dishes/[id]/page.tsx`, `loading.tsx`, `not-found.tsx`
- Client root: `app/dishes/[id]/components/DishPageClient.tsx`
- Hero + actions: `DishHeroV2.tsx`, `DishActionsBar.tsx`
- Resumen blocks: `EditorialStoryCard.tsx`, `DishDescriptionCard.tsx`, `DishStatsPanel.tsx` (rating histogram + portion + would-order-again), `TasteProfile.tsx` (tags + pros/cons), `DishDiaryPulse.tsx`, `RestaurantContextCard.tsx`, `RelatedDishesCarousel.tsx`
- Reseñas + Fotos: `DishReviewsTab.tsx` (filtros sort/conPhotos), `DishPhotoMosaic.tsx` (reusa `app/restaurants/[id]/components/Lightbox.tsx`)
- Tabs: `DishTabs.tsx` (sticky top-14, URL-synced)
- Tipos: extendidos en `app/lib/types/social.ts` (`DishDetail`, `DishAggregates`, `DishPhoto`, `DishDiaryStats`, `RelatedDishItem`)
- API: `app/lib/api/dishes-social.ts` (5 fetchers + DTO mappers)

**No-objetivos shipped**:
- Rating multidimensional por plato (sabor/presentación/etc) — sigue siendo Fase 2; requiere refactor de compose.
- Embeddings/pg_trgm para related dishes — ILIKE basta para v1.
- OCR de menú para correlacionar dish↔ítem de carta.

**Pendientes / decisiones futuras**:
- El blurb a veces sale corto en datasets pobres (caso "muzzarella" → "La 'muzzarella',"). Considerar `min_tokens` o un retry si el output < 60 chars. No urgente.
- Los recent_eaters se ven sin avatares para usuarios sin `avatar_url`; muestra iniciales — funciona pero el carbon-soft contrast podría mejorarse.
- En mobile el bottom-nav global se superpone con el stats panel — issue global, no de la página de dish.
