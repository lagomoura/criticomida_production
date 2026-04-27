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

The backend FastAPI server (in `backend/` git submodule) must be running on `http://localhost:8002` for API calls to work. Start it from `backend/` with `docker compose up` — the compose file maps host `:8002` → container `:8000` so the host's `:8000` stays free for other projects. The container entrypoint runs `alembic upgrade head` before starting uvicorn, both locally and on Railway.

## Dev vs Prod

Two parallel tracks; the databases never connect:

|              | Dev (local)                                          | Prod                                       |
|--------------|------------------------------------------------------|--------------------------------------------|
| Frontend     | `npm run dev` on host                                | Vercel (auto-deploy from GitHub)           |
| Backend      | `docker compose up` in `backend/`                    | Railway (auto-deploy from backend repo)    |
| Database     | Postgres in compose, seeded from a prod snapshot     | Railway managed Postgres                   |
| Migrations   | Run via `entrypoint.sh` on container start           | Same — alembic runs before uvicorn         |

### Start dev (first time)

```bash
cd backend
docker compose up -d db                      # Postgres only
./scripts/restore_dev_db.sh                  # load snapshot (see script header)
docker compose up api                        # alembic upgrade head + uvicorn
# in another terminal, from repo root:
npm run dev
```

After the first run, `docker compose up` (no `down -v`) preserves the seeded data in the `pgdata` volume.

### Refresh dev baseline from prod

When you want dev to mirror prod again, run a fresh `pg_dump` against Railway's public Postgres URL and overwrite `backend/scripts/seeds/dev_baseline.dump`. The full command is in the header of `backend/scripts/restore_dev_db.sh`.

### Deploys

- Push to `main` of the frontend repo → Vercel builds and deploys.
- Push to `main` of the backend submodule's own repo → Railway rebuilds the Docker image. The entrypoint runs `alembic upgrade head` automatically, so new migrations land before the API starts serving.

### Environment variables

Frontend env files (Next.js convention):
- `.env.development` — committed, no secrets, dev defaults.
- `.env.development.local` — gitignored, dev keys (Google Maps, fal.ai, Gemini).
- `.env.example` — committed template.
- Vercel UI — prod values (`NEXT_PUBLIC_API_URL=<railway>`, plus all `NEXT_PUBLIC_*` keys and any server-side keys).

Backend env:
- `backend/.env` — gitignored, full-docker mode (`DATABASE_URL=...@db:5432/...`).
- `backend/.env.example` — committed template documenting both modes.
- Railway UI — prod values. `DATABASE_URL` auto-injected by the Postgres service. Set `JWT_SECRET` to a fresh `openssl rand -hex 32`, `COOKIE_SECURE=true`, `APP_ENV=production`.

`NEXT_PUBLIC_` prefix exposes a var to the browser.

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
