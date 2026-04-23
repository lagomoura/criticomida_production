# Social API mocks

The backend (`backend/` submodule) currently has routers for `auth`, `categories`,
`chat`, `dishes`, `feedback`, `images`, `menus`, `ratings`, `restaurants` and
`reviews`. It has **no** endpoints for:

- Feed (`GET /api/feed`)
- Likes (`POST|DELETE /api/reviews/{id}/like`)
- Comments (`GET|POST /api/reviews/{id}/comments`, `DELETE /api/comments/{id}`)
- Follows (`POST|DELETE /api/users/{id}/follow`)
- Notifications (`GET /api/notifications`, `POST /api/notifications/{id}/read`)
- Public user profile (`GET /api/users/{id}`)
- Search (`GET /api/search`)

Until those land, the frontend uses mocks gated behind a flag so the social UI
can ship and iterate without blocking on backend work.

## How it works

Each social API module (e.g. `app/lib/api/feed.ts`) begins with:

```ts
import { isSocialMockEnabled, mockDelay } from './_mocks';
import { mockFeed } from './_mocks/feed';

export async function getFeed(params: GetFeedParams) {
  if (isSocialMockEnabled()) {
    await mockDelay();
    return mockFeed(params);
  }
  return fetchApi<FeedResponse>(`/api/feed?${qs(params)}`);
}
```

When `NEXT_PUBLIC_SOCIAL_MOCK=true`, the module returns deterministic fixtures
from this folder. Otherwise it hits the real API via `fetchApi`. No other
code in the app needs to care which mode is active.

## Enabling

In `.env.local`:

```
NEXT_PUBLIC_SOCIAL_MOCK=true
```

Restart the dev server.

## Disabling

Remove the env var (or set it to anything other than `"true"`) and restart.
Any module that still calls a missing endpoint will get a real 404 — that is
the signal that backend parity is needed.

## Adding a new mock

1. Create `app/lib/api/_mocks/<domain>.ts` exporting a function shaped like the
   real endpoint response (same TypeScript type from `app/lib/types/`).
2. Import and call it from the corresponding `app/lib/api/<domain>.ts` module,
   gated by `isSocialMockEnabled()`.
3. Keep fixtures deterministic (no `Math.random()` in ids / timestamps) so
   screenshots and tests stay stable across runs.
