---
name: CritiComida DB State & Data Scripts
description: Current real-data state of the database, schema changes, import scripts, and backend constraints
type: project
---

## DB content (as of ~2026-03-20 import)

83 real restaurants imported from the owner's Google Maps Takeout (GeoJSON). These replaced 152 fake seed restaurants (deleted).

- **83 restaurants** with coordinates, dimensional ratings (food_quality/service/ambiance), diary entries
- **38 restaurants** have `category_id` assigned (keyword-matched by script)
- **45 restaurants** have `category_id = NULL` — mostly breweries, pizzerias, Italian spots that didn't match existing categories
- **33 dishes** with cover photos, distributed across 12 restaurants
- **27 DishReviews** created from Google Maps review text + food_quality ratings

## DB connection

- From host: `postgresql+asyncpg://criticomida:criticomida_secret@localhost:5433/criticomida`
- Inside Docker: `db:5432` (Docker hostname)
- Extension: `citext` enabled (used for `users.email` — case-insensitive)

## Schema notes (cumulative)

- `restaurant.category_id` is **nullable** (Alembic migration applied ~2026-03-20)
- `restaurant.opening_hours` is **JSONB array** (weekday text strings from Google Places)
- `restaurant.price_level` is SmallInteger (nullable); `restaurant.google_place_id`, `website`, `phone_number`, `google_maps_url` all nullable
- `CategoryResponse` now includes `review_count` — computed via subquery in categories router (fixed ~2026-04-02)
- `RestaurantListResponse` now includes `latitude` and `longitude` (added ~2026-04-02)
- `DishReview` has `is_anonymous: bool` (default `false`) — migration `007_dish_review_anonymous.py` (~2026-04-02)
- `DishCreate.restaurant_id` is **optional** in backend schema — endpoint derives it from the URL slug
- `RestaurantRatingDimension` has 5 dimensions: `cleanliness`, `ambiance`, `service`, `value`, `food_quality` (each 1-5)

## Backend search capabilities

- Restaurant search uses PostgreSQL **ILIKE** (`%term%`) against `name` and `location_name` only
- **No full-text search, no trigram indexes, no vector search** as of 2026-04-04
- Dishes have **no search endpoint** — only listable by restaurant slug or fetched by ID
- AI-assisted search/recommendations using LiteLLM is planned but not built

## Migration history (key entries)

- `001_initial_schema.py` — base schema
- `007_dish_review_anonymous.py` — adds `is_anonymous` column to `dish_reviews` table
- `008_add_otros_category.py` — creates "Otros" category (`display_order=99`); this category is intentionally hidden from public UI

## Import / utility scripts

All scripts are in `backend/scripts/`:

- `import_google_maps.py` — imports restaurants from Google Takeout GeoJSON. Dry-run by default, use `--commit` to write to DB. Filters non-food venues by keyword.
- `categorize_restaurants.py` — assigns `category_id` to restaurants via name keyword matching. Dry-run by default.
- `dish_mapping.yaml` — in `google_maps_data/`, pre-filled mapping of Pratos JSON entries to restaurant IDs (32/33 auto-matched).

## Seed credentials

- `admin@criticomida.com` / `admin123` (created by `migrate_mock_data.py`)

**Why:** Real data was imported from owner's personal Google Maps history. The scripts are the source of record for how the DB was populated and can be re-run.

**How to apply:** When working with restaurant/dish data, be aware counts reflect real personal reviews, not synthetic seed data. The 45 uncategorized restaurants are a known gap — don't remove or restructure them.
