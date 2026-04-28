---
name: CritiComida Deploy State
description: Live deploy state — Vercel frontend + Railway backend, both running as of 2026-04-27. CLAUDE.md is the source of truth for workflow.
type: project
originSessionId: a1f24859-0efc-4d42-9b2e-1972a5e9dbb5
---
**Status (2026-04-27):** MVP demo deployed and reachable.

- **Frontend:** Vercel project `criticomida-production-qqyr`, auto-deploy from `lagomoura/criticomida_production` main → `https://criticomida-production-qqyr.vercel.app`.
- **Backend:** Railway, auto-deploy from `lagomoura/criticomida-backend` main → `https://criticomida-backend-production.up.railway.app`.
- **Database:** Railway managed Postgres, seeded with a `pg_dump --data-only` from local on 2026-04-27 (~92 restaurantes, 41 dishes, 62 users). Plus 41 fal.ai-generated cover images attached via `scripts/seed_review_images.py`.

**Workflow doc:** `CLAUDE.md` was updated with the dev-vs-prod split, env var locations, and migration entrypoint. Treat that as canonical — this memory is just deploy state.

**MCPs registered locally** (need OAuth via `/mcp` after a Claude Code restart):
- `vercel` → `https://mcp.vercel.com`
- `railway` → `https://mcp.railway.com`

## Gotchas hit during initial deploy

1. **Railway injects `DATABASE_URL=postgresql://…`** without a driver suffix → SQLAlchemy picks psycopg2 (not installed). Fixed by `_async_db_url()` helper in `backend/app/database.py` that normalizes to `postgresql+asyncpg://`. Reused in `alembic/env.py`.
2. **Vercel `NEXT_PUBLIC_*` are baked at build time.** Adding env vars after a failed deploy is not enough — must redeploy without cache. Symptom: bundle requests `localhost:8000` from a vercel.app origin.
3. **CORS rejects with HTTP 400 "Disallowed CORS origin"** when `CORS_ORIGINS` doesn't list the Vercel domain (no wildcards possible because of `credentials: 'include'`). Backend reads it as comma-separated; no spaces, no trailing slash.
4. **Submodule init in Vercel** — disabled (the `backend/` submodule is only used for `npm run test:backend`, not for `next build`). Avoids needing SSH access to the backend repo from Vercel.
5. **Cross-site cookies (Vercel ↔ Railway).** `attach_auth_cookies` originally hardcoded `samesite="lax"`; under cross-site fetch the browser silently drops the cookie and `/api/auth/me` always returns 401 "Not authenticated". Fixed 2026-04-27 by deriving `samesite` from `COOKIE_SECURE`: prod (`COOKIE_SECURE=true`) → `SameSite=None; Secure`, dev (`COOKIE_SECURE=false`) → `SameSite=Lax`. Same change applied to `clear_auth_cookies` so the browser matches and deletes the right cookie.

## Refreshing dev DB from prod

Already documented in `backend/scripts/restore_dev_db.sh` per CLAUDE.md. The header of that script has the `pg_dump` command pointed at Railway's `DATABASE_PUBLIC_URL`.
