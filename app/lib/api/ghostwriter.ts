/**
 * Client for the Ghostwriter assist endpoints.
 *
 * The user can either pass a public photo URL (JSON path) or a binary
 * file (multipart). Multipart is the common case in the review form
 * because the photo isn't uploaded to S3 yet — it lives in browser
 * memory until the user submits the review.
 */

import { fetchApi } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface GhostwriterSuggestions {
  tags: string[];
  visible_ingredients: string[];
  plating_style: string | null;
  editorial_blurb: string | null;
  suggested_pros: string[];
  suggested_cons: string[];
  /** Tags that don't already appear in the user's draft. */
  new_tags: string[];
}

export interface AssistJsonRequest {
  dish_id?: string;
  photo_url?: string;
  draft_text?: string;
  /**
   * Page locale (``es`` | ``en`` | ``pt``). The Ghostwriter must write
   * tags, blurb and pros/cons in the language the user is reading the
   * site in — not the backend's hardcoded default.
   */
  locale?: string;
}

export async function assistWithUrl(
  body: AssistJsonRequest,
): Promise<GhostwriterSuggestions> {
  return fetchApi<GhostwriterSuggestions>('/api/dish-reviews/assist', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface AssistUploadInput {
  photo: File;
  dishId?: string;
  draftText?: string;
  /** Page locale — see ``AssistJsonRequest.locale``. */
  locale?: string;
}

/**
 * Multipart variant. ``fetchApi`` is JSON-first, so we call ``fetch``
 * directly to ship FormData with credentials.
 */
export async function assistWithUpload({
  photo,
  dishId,
  draftText,
  locale,
}: AssistUploadInput): Promise<GhostwriterSuggestions> {
  const fd = new FormData();
  fd.append('photo', photo);
  if (dishId) fd.append('dish_id', dishId);
  if (draftText) fd.append('draft_text', draftText);
  if (locale) fd.append('locale', locale);

  const res = await fetch(`${BASE_URL}/api/dish-reviews/assist/upload`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      // FastAPI 422 returns `detail` as an array of validation errors:
      // [{ loc: [...], msg: "...", type: "..." }, ...]. The default
      // template-literal coercion produced "[object Object]"; flatten it
      // so the user sees what actually failed.
      if (Array.isArray(body.detail)) {
        detail = body.detail
          .map(
            (e: { loc?: unknown[]; msg?: string }) =>
              `${(e.loc ?? []).join('.')}: ${e.msg ?? 'invalid'}`,
          )
          .join('; ');
      } else if (typeof body.detail === 'string') {
        detail = body.detail;
      }
    } catch {
      /* not json */
    }
    throw new Error(`Ghostwriter assist failed: ${res.status} ${detail}`);
  }
  return (await res.json()) as GhostwriterSuggestions;
}
