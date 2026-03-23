# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run dev:clean    # Wipe .next cache and start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run test:backend # Run pytest in backend/ submodule
```

The backend FastAPI server (in `backend/` git submodule) must be running on `http://localhost:8000` for API calls to work. Start it separately.

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<key>
```

`NEXT_PUBLIC_` prefix exposes these to the browser. There is no `.env.example`; `.env` contains the actual values.

## Architecture

**Next.js 15 App Router** with a separate **FastAPI backend** (git submodule at `backend/`). The Next.js app is a pure frontend — all API calls proxy directly to the FastAPI server; there are no Next.js API route handlers.

### Data Flow

1. API calls are made from `app/lib/api/` modules using `fetchApi` in `app/lib/api/client.ts`
2. `fetchApi` handles auth token refresh automatically: on 401, it retries via `/api/auth/refresh` using httpOnly cookies (`credentials: 'include'`)
3. Auth state lives in `AuthContext` (`app/lib/contexts/AuthContext.tsx`), consumed via `useAuth()` hook
4. Types in `app/lib/types/` model the backend API responses

### Key Architectural Patterns

- **`'use client'`** is required on any component using React state/effects or browser APIs. Pages under `restaurants/[id]` and most interactive components are client components.
- **Suspense boundaries** wrap async data-fetching sections (e.g., `ReviewsSection` on the home page)
- **Fallback data** in `app/data/` is used when the API is unavailable
- **`@/` path alias** maps to the project root (`@/app/lib/types` etc.)

### Type System

Core types in `app/lib/types/`:
- `RestaurantListItem` / `RestaurantDetail` — API shapes for restaurant endpoints
- `Dish` / `DishReview` / `Plate` — `Plate` is a view-model that merges dish + review data for the restaurant detail page
- `User` with roles: `'admin' | 'critic' | 'user'`
- `PaginatedResponse<T>` — all list endpoints return this shape

### Styling

Tailwind CSS 4 with custom CSS variables defined in `globals.css`:
- `--mainPink: #ef7998` — primary brand color
- `.cc-container` — standard page width container (max 72rem, centered)
- Font: Source Sans 3 (weights 400/600/700/800)
