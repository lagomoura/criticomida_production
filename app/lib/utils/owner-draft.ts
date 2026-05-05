/**
 * Local-only persistence for unpublished owner replies.
 *
 * The owner review modal auto-saves the textarea to localStorage on
 * every keystroke so a refresh / Esc / accidental tab close doesn't
 * make the owner retype. The owner dashboard reads the same store to
 * paint a "Borrador" badge on each review card with a draft —
 * otherwise the owner has to open every card to find the unfinished
 * ones.
 *
 * Scope is intentionally a single device. Cross-device drafting
 * would need a backend table (`owner_review_drafts` keyed by
 * ``(user_id, review_id)``) and a sync endpoint; the bar for that
 * is genuine demand we don't have yet.
 *
 * Storage shape: one entry per review id with the raw textarea
 * value. Empty values get removed (a "draft" of empty text is
 * indistinguishable from no draft).
 */

const LOCAL_DRAFT_PREFIX = 'cc:owner-review-draft:';

function localDraftKey(reviewId: string): string {
  return `${LOCAL_DRAFT_PREFIX}${reviewId}`;
}

export function readLocalDraft(reviewId: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(localDraftKey(reviewId)) ?? '';
  } catch {
    return '';
  }
}

export function writeLocalDraft(reviewId: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (value.trim().length === 0) {
      window.localStorage.removeItem(localDraftKey(reviewId));
    } else {
      window.localStorage.setItem(localDraftKey(reviewId), value);
    }
  } catch {
    /* localStorage may be unavailable (private mode, quota) — the
       modal still works, drafts just don't persist across closes. */
  }
}

/**
 * Return every review id that currently has a non-empty local
 * draft. Used by the dashboard to paint the "Borrador" badge.
 *
 * Single full scan of ``localStorage`` keys: drafts are bounded by
 * how many reviews the owner has open, typically a handful. If we
 * ever bound this in the hundreds we can switch to a single index
 * key holding a JSON list and update it on every write.
 */
export function listReviewIdsWithDraft(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const out: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(LOCAL_DRAFT_PREFIX)) continue;
      const value = window.localStorage.getItem(key) ?? '';
      if (value.trim().length === 0) continue;
      out.push(key.slice(LOCAL_DRAFT_PREFIX.length));
    }
    return out;
  } catch {
    return [];
  }
}
