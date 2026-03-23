---
name: Restaurant Detail Page Architecture
description: Design decisions and component structure for the restaurant detail page redesign (dish-checklist-first UX)
type: project
---

The restaurant detail page was redesigned in March 2026 to put dishes as the primary feature.

**Why:** CritiComida is dish-focused, not restaurant-focused. The old page buried dishes in a PlateGallery grid; the new page surfaces them as an interactive checklist.

**How to apply:** When building new features for this page, keep dishes at the top of the page hierarchy. Restaurant-level metadata (location, photos) is secondary.

## New component tree

- `RestaurantHero` — cover image band + name, rating, location. Replaces RestaurantHeader.
- `DishChecklist` — section wrapper with progress bar (X of N reviewed by current user), "Add dish" CTA, empty state.
- `DishChecklistItem` — one row per dish: thumbnail, name, rating badge, "Revisado" badge, expand/collapse for reviews, inline "Reseñar" button.
- `DishReviewForm` — full review form (stars, would-order-again toggle, pros/cons multi-input, portion, date, tags). Hits `createReview` API directly.
- `AddDishModal` — modal for creating a new dish, hits `createDish` API. Replaces local-state-only `AddPlateModal`.
- `StarRating` — interactive or readonly star picker, reusable.

## Data model in page.tsx

`dishItems: { dish: Dish; reviews: DishReview[] }[]` — replaces the `Plate[]` view-model approach. Raw API data is kept so `DishChecklistItem` can do `user_id` matching.

## Optimistic local state updates

After a new review is submitted, `handleReviewAdded` locally recalculates `computed_rating` and `review_count` on the dish without re-fetching. After a dish is created, it's prepended to `dishItems`.

## Removed from page

`ProsCons`, `DiaryEntry`, `MenuSection`, `AddPlateModal` are no longer rendered (kept as files, not deleted). The old `PlateGallery`/`PlateCard` components are preserved but unused in the new layout.
