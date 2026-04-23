/**
 * Social mock flag + helper.
 *
 * Social endpoints (feed, likes, comments, follows, notifications) do not
 * exist yet in the FastAPI backend. Each social API module checks
 * `isSocialMockEnabled()` and, when true, returns fixtures from this folder
 * instead of hitting the network.
 *
 * Enable by setting in .env.local:
 *
 *   NEXT_PUBLIC_SOCIAL_MOCK=true
 *
 * When the backend ships the real endpoints, flip the flag off (or remove
 * the env var) and the same frontend code starts hitting HTTP.
 */

export function isSocialMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SOCIAL_MOCK === 'true';
}

/** Simulates network latency so optimistic UI and loading states stay honest. */
export function mockDelay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
