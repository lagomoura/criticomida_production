---
name: Restaurant Profile Page v2 (página estrella)
description: Estado de la página /restaurants/[id] tras shipping de Fases A+B+C — what shipped, qué falta, archivos clave
type: project
originSessionId: b1081c8d-a159-4e0d-8753-1e2b899476b0
---
Shipped 2026-04-26/27: la página `/restaurants/[id]` se rediseñó como **página estrella** con tabs sticky (Resumen / Platos / Reseñas / Fotos / Info), Server Component + islas client, paleta v2 Especiería + Cormorant.

**Why:** el usuario lo pidió explícitamente como segunda página principal del proyecto junto al feed. Diseño editorial, no perfil de usuario.

**How to apply:** al planear cambios en restaurants:
- La página principal es `app/restaurants/[id]/page.tsx` (async Server Component, fetch paralelo con `Promise.allSettled`).
- Estado de platos/reseñas vive en `RestaurantPageClient.tsx` (cliente). Toda interacción que necesite estado va en islas client; resto es server-rendered para SEO.
- El refactor reemplazó `RestaurantHero` viejo (Client) por `HeroV2.tsx` (Server) — `RestaurantHero.tsx` quedó deprecated pero todavía existe.
- Tabs visibility con `hidden` attribute (no condicional) para mantener todo el contenido en HTML inicial.

**Endpoints backend nuevos** (`backend/app/routers/restaurants.py`, lógica en `restaurant_service.py`):
- `GET /{slug}/aggregates` · `GET /{slug}/photos` · `GET /{slug}/diary-stats` · `GET /{slug}/signature-dishes` · `GET /{slug}/nearby?radius_km=&limit=` · `POST /{slug}/refresh-google` (admin/critic)

**Migration aplicada**: `014_restaurant_google_enrichment.py` — campos `google_rating`, `google_user_ratings_total`, `google_photos JSONB`, `editorial_summary`, `editorial_summary_lang`, `cuisine_types TEXT[]`, `google_cached_at`.

**Pendiente para activar Fase B real**: agregar `GOOGLE_PLACES_API_KEY` al backend env. Sin clave, `google_places_enricher.py` degrada silencioso (BackgroundTasks no-op). El primer hit a `GET /{slug}` con clave configurada dispara refresh lazy en background.

**Pendientes Fase C** (documentadas en `~/.claude/plans/me-gustaria-crear-la-kind-donut.md`):
- C3 Popular times: requiere lib `populartimes` (scraper no oficial) + worker scheduled
- C4 Diario social: endpoint `GET /{slug}/social-visits?friends_only=true` + integración bookmarks API existente
- C5 Menú OCR: worker separado (Tesseract o Google Cloud Vision) + tabla `menu_entries`

**Archivos clave a recordar:**
- Server: `app/restaurants/[id]/page.tsx`, `loading.tsx`, `not-found.tsx`
- Client root: `app/restaurants/[id]/components/RestaurantPageClient.tsx`
- Hero + actions: `HeroV2.tsx`, `RestaurantActionsBar.tsx`, `OpenStatus.tsx`, `DistanceBadge.tsx`
- Resumen: `RatingsRadar.tsx`, `ProsConsAggregated.tsx`, `SignatureDishes.tsx`, `DiaryPulse.tsx`, `EditorialSummaryCard.tsx`, `NearbyRestaurantsCarousel.tsx`
- Fotos: `PhotoMosaic.tsx` (mezcla UGC + Google photos), reusa `Lightbox.tsx` existente
- Util: `app/lib/utils/openingHours.ts`, `app/lib/hooks/useUserLocation.ts`
- Tipos/API: `app/lib/types/restaurant.ts`, `app/lib/api/restaurants.ts`
- Backend: `backend/app/services/google_places_enricher.py`, `backend/app/services/restaurant_service.py` (queries de agregación + nearby Haversine en SQL)

**Decisión sobre nearby**: Haversine vía SQLAlchemy expressions (sin extensión Postgres). Para escala >10k restaurants, migrar a `cube + earthdistance` con índice GIST.
