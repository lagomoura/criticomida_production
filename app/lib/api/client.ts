const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type FastAPIValidationItem = {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
};

function formatErrorDetail(raw: unknown, fallback: string): string {
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw)) {
    const messages = raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const it = item as FastAPIValidationItem;
          const msg = (it.msg ?? '').trim();
          const field =
            Array.isArray(it.loc) && it.loc.length > 1
              ? String(it.loc[it.loc.length - 1])
              : '';
          return field && msg ? `${field}: ${msg}` : msg;
        }
        return '';
      })
      .filter(Boolean);
    if (messages.length) return messages.join('; ');
  }
  return fallback;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`API error: ${status} ${detail}`);
    this.status = status;
    this.detail = detail;
  }
}

/** Clears httpOnly auth cookies via the API (best-effort). */
export async function clearSessionCookies(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    /* ignore network errors */
  }
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Best-effort check that the session is currently usable. Used as a tiebreaker
 * when our own refresh call fails: another tab (or a concurrent request flow)
 * may have just rotated the refresh token and written fresh cookies. In that
 * race our refresh legitimately 401s, but the session is alive — so we must
 * re-verify before tearing it down, otherwise the loser of the race logs the
 * user out (and `clearSessionCookies()` would even revoke the winner's brand
 * new session). Raw fetch, never `fetchApi`, to avoid recursing into refresh.
 */
async function sessionStillValid(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (res.ok) return true;
      // Our refresh failed. Before declaring the session dead, check whether
      // a concurrent rotation already left us authenticated. Only clear if
      // the session is genuinely gone.
      if (await sessionStillValid()) return true;
      await clearSessionCookies();
      notifyAuthCleared();
      return false;
    } catch {
      if (await sessionStillValid()) return true;
      await clearSessionCookies();
      notifyAuthCleared();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function notifyAuthCleared(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:cleared'));
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const { skipAuth, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {};

  const isFormData = fetchOptions.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const mergedHeaders = {
    ...headers,
    ...(fetchOptions.headers as Record<string, string>),
  };

  let res = await fetch(url, {
    ...fetchOptions,
    headers: mergedHeaders,
    credentials: 'include',
  });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
        credentials: 'include',
      });
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = formatErrorDetail(body?.detail, detail);
    } catch {
      // response body is not JSON
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
