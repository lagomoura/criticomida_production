---
name: CritiComida Open Issues & Next Steps
description: Known bugs, resolved items, completed features, and non-obvious behaviors — updated 2026-04-04
type: project
---

## Open bugs

*(None currently known — see resolved section below)*

## Planned features (not yet built)

### `/plan` page
- A page for planning restaurant visits or food itineraries
- Explored but not designed/built as of 2026-04-02
- The owner had a specific UX in mind but session ended (rate limit) before clarifying requirements
- Data foundation is ready: 83 restaurants with coordinates, ratings, diary entries

### AI-powered search / recommendations
- Explored in ~2026-04-04 session: proposed using **LiteLLM** for a unified multi-model interface (Claude, GPT-4o, Gemini, etc.) for restaurant/dish recommendations
- Backend search currently uses ILIKE only — no full-text or vector search built yet
- Not implemented as of 2026-04-04

## Non-obvious behavioral decisions (active)

### Anonymous reviews — `MyReview` shows real name to owner
- When `is_anonymous=True`, the backend sets `user_display_name=None` on public responses
- But `MyReviewResponse` (used in `/profile`) intentionally overrides this: the owner sees their own real name even on anonymously posted reviews
- Migration: `007_dish_review_anonymous.py`

### Photo upload order matters
- Photos are uploaded to `POST /api/images/upload` FIRST (returns URLs)
- Only then is the review created with those URLs in `images[]`
- The `EntityType` enum in the backend doesn't include `dish_review` — the upload endpoint doesn't need it

### `AddDishModal` 2-step with double-notify guard
- Step 1: create the dish. Step 2: optionally review it.
- `notifiedRef` ensures `onDishCreated` is called exactly once regardless of which close path fires (X, backdrop, skip, success)
- Backdrop is blocked in step 2 to prevent interrupting an in-flight review submit
- `DishReviewForm` has a `cancelLabel` prop that `AddDishModal` sets to "Saltar"

### `DishCreate.restaurant_id` is optional
- The backend `DishCreate` schema has `restaurant_id` as optional — the endpoint derives it from the URL slug
- Frontend doesn't need to send it; if sent it's ignored (`exclude={"restaurant_id"}`)

### "Otros" category is internal-only (hidden from public UI)
- The "Otros" category exists in the DB (`slug='otros'`, `display_order=99`) and works as an internal staging bucket
- It is **not shown** in category cards (ReviewsSection), filter buttons, or the AddRestaurantModal category dropdown
- When a user with role `admin` adds a restaurant and needs a new category, the modal has an inline "Nueva categoría" flow:
  - Duplicate-checks by name/slug against existing categories
  - Generates a cover image via fal.ai FLUX-schnell (`POST /api/generate-category-image` — a Next.js route exception)
  - Creates the category (`POST /api/categories` — admin-only), then creates the restaurant
  - Requires `FAL_KEY` env var; if absent the image step is silently skipped
- Non-admin users only see existing categories (no "Otros" option visible to them either)

### `app/api/generate-category-image/route.ts` — exception to no-API-routes rule
- The project architecture says "no Next.js API route handlers"
- This one file is a deliberate exception: it proxies fal.ai image generation to avoid exposing `FAL_KEY` in the browser
- Env var: `FAL_KEY` — get at fal.ai/dashboard/keys

### Creating dishes requires `admin` or `critic` role
- `POST /api/restaurants/{slug}/dishes` requires `require_role(admin, critic)` 
- Regular users can write reviews but cannot create dishes

## Resolved (as of these sessions)

### ~~Category cards showed "0 reseñas"~~
- **Fixed ~2026-04-02**: `CategoryResponse` in `backend/app/schemas/category.py` now includes `review_count` (computed via subquery in categories router)
- Frontend `Category` type at `app/lib/types/category.ts` has `review_count: number` (non-optional)

## Completed features

### Chat widget (RAG chatbot) — ~2026-04-06
- Floating 💬 button (bottom-right), panel with message history, typing indicator, Enter-to-send, dark mode support
- Backend: `backend/app/services/chat_service.py` (keyword RAG via ILIKE → loads restaurant + dish + review context → LiteLLM call), `backend/app/routers/chat.py` (`POST /api/chat`, public, 1–500 chars)
- Frontend: `app/lib/api/chat.ts`, `app/components/ChatWidget.tsx`, mounted globally in `app/components/Providers.tsx`
- Model configured via env: `CHAT_MODEL=gemini/gemini-2.5-flash` + `CHAT_API_KEY`
- `litellm` added to `backend/requirements.txt`
- LiteLLM prefix for Google: `gemini/` (not `google/`)

### Brand identity v2 applied — ~2026-04-06
- `docs/brand-identity-v2.md` created and applied to `globals.css`, `layout.tsx`, `AboutSection.tsx`, `ServicesSection.tsx`
- New palette: Pimentón `#C8391A`, Azafrán `#E0971E`, Crema `#FAF6EE`, warm-gray neutrals
- Lora (serif) added as display font alongside Source Sans 3

### Profile page (`/profile`) — ~2026-04-04
- Full user profile: avatar initial, display name, role badge, email
- Grid of user's own reviews with edit/delete actions
- `AddReviewModal`: multi-step — search restaurant (debounce) → pick dish → `DishReviewForm`
- `EditReviewModal` for basic field updates
- Backend: `GET /api/users/me/reviews` → returns `MyReview` type with `dish_name`, `restaurant_name`, `restaurant_slug`

### Restaurant rating dimensions UI — ~2026-04-04
- `RestaurantRatingSection` component on the restaurant detail page
- Calls `GET /api/restaurants/{slug}/ratings` and `PUT /api/restaurants/{slug}/ratings`
- 5 dimensions: cleanliness, ambiance, service, value, food_quality (1-5 scale)
- `app/lib/api/ratings.ts` added for these endpoints

### `TopReviewsGrid` on restaurant detail — ~2026-04-04
- Replaced the earlier `DishPhotoGrid` and `PhotoGallery` components
- Shows up to 8 cards with dish photo + review note overlay (bottom of restaurant detail page)
- Includes dish cover photos from Google Maps (`lh3.googleusercontent.com`) + user-uploaded review images
- File: `app/restaurants/[id]/components/TopReviewsGrid.tsx`

### `DishReviewForm` horizontal layout — ~2026-04-03
- Form reformatted to 2-column grid (was single-column vertical)
- Left: star rating + would_order_again + notes. Right: pros + cons
- Bottom row: portion, date, visited_with, tags
- `AddDishModal` step 2 expanded to `max-w-2xl` (was `max-w-md`)

### Brand identity document — ~2026-04-03
- Created `docs/brand-identity.md` — canonical reference for colors, typography, components, animations, layout tokens
- Includes: dual color palette rationale (legacy brand vs. UI system), SVG logo description (mascot), easing curve `cubic-bezier(0.4,2,0.6,1)`, full CSS token table

### Dark/light mode — 2026-04-03
- Class-based: `.dark` on `<html>` toggles theme
- `ThemeContext` at `app/lib/contexts/ThemeContext.tsx` — persists to localStorage, respects `prefers-color-scheme` as default
- Anti-flicker inline script in `<body>` runs before React hydration
- Tailwind CSS 4: `@custom-variant dark`, neutral scale mapped to CSS vars in `@theme inline`

### Map markers in category pages — ~2026-04-02
- `latitude`/`longitude` are now in `RestaurantListItem` (added to backend `RestaurantListResponse`)
- `BoundsFitter` internal component auto-fits map bounds to all markers
- `maps.googleapis.com` added to `next.config.ts` allowed image hostnames

### Anonymous reviews — ~2026-04-02
- `is_anonymous` checkbox in `DishReviewForm`
- Backend migration `007_dish_review_anonymous.py`

### Photo upload in dish reviews — ~2026-04-02
- Thumbnail previews in `DishReviewForm`, uploaded via `uploadReviewPhoto()` in `app/lib/api/reviews.ts`

### `AddRestaurantModal` in category pages — ~2026-04-02
- Lives at `app/reviews/[category]/AddRestaurantModal.tsx`
- Uses Google Maps Places Autocomplete to fill coordinates, phone, website, opening hours, price level
- Only visible to authenticated users via `CategoryPageClient.tsx`
- Admin users see the "Nueva categoría" flow (see above)
