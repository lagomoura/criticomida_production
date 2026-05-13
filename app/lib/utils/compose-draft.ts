/**
 * Local-only persistence for the /compose review form. The user is typically
 * reviewing a dish at the restaurant — any interruption (incoming call, app
 * suspension, accidental tab close) used to wipe the in-progress review. We
 * autosave on every edit so the next visit to /compose offers to restore.
 *
 * Photos are intentionally NOT persisted: File/Blob references cannot survive
 * a reload, and re-syncing a stale `URL.createObjectURL` would point at
 * nothing. The UX accepts that the user re-attaches the photos but keeps the
 * text/rating/metadata, which is the costly part to retype.
 *
 * Storage shape: a single key holding the serializable parts of the form. The
 * key is global per device — only one /compose draft at a time, which mirrors
 * the page's single-form nature.
 */
import type { SelectedPlace } from '@/app/components/social/RestaurantAutocomplete';
import type { SelectedDish } from '@/app/components/social/DishAutocomplete';
import type { ReviewFormBodyValue } from '@/app/components/social/ReviewFormBody';
import type { PriceTier } from '@/app/lib/types/social';

const COMPOSE_DRAFT_KEY = 'cc:compose-draft:v1';

export interface ComposeDraftSnapshot {
  place: SelectedPlace | null;
  dish: SelectedDish | null;
  priceTier: PriceTier | null;
  body: Omit<ReviewFormBodyValue, 'photos' | 'existingImages'>;
  /** Optional flag added in the progressive-disclosure redesign. When the
   * restored body carries any optional content (pros/cons/pillars/etc.), the
   * compose page pre-expands "Agregar detalles" so the user lands on what
   * they were filling out. Optional → drafts written before this field exist
   * are forward-compatible without bumping the storage-key version. */
  expandedDetails?: boolean;
  savedAt: number;
}

/** Returns true when the saved body has any optional / "details" content that
 * lives below the essentials block of the compose form (pros, cons, tags,
 * pillars, portion, meal period, company, price). The compose page uses this
 * on restore to decide whether to auto-expand the "Agregar detalles" panel.
 * Note: `note`, `rating`, `wouldOrderAgain` and `dateTasted` are NOT details
 * — they belong to the essentials block. */
export function hasDetailsContent(
  body: Pick<
    ReviewFormBodyValue,
    | 'pros'
    | 'cons'
    | 'tags'
    | 'pillars'
    | 'portionSize'
    | 'mealPeriod'
    | 'companyType'
    | 'visitedWith'
    | 'pricePaid'
    | 'isAnonymous'
  >,
): boolean {
  if (body.pros.length || body.cons.length || body.tags.length) return true;
  if (body.pillars.presentation || body.pillars.value_prop || body.pillars.execution) return true;
  if (body.portionSize) return true;
  if (body.mealPeriod) return true;
  if (body.companyType) return true;
  if (body.visitedWith.trim()) return true;
  if (body.pricePaid.trim()) return true;
  if (body.isAnonymous) return true;
  return false;
}

function isEmptySnapshot(snap: ComposeDraftSnapshot): boolean {
  if (snap.place || snap.dish) return false;
  if (snap.priceTier) return false;
  const b = snap.body;
  if (b.note.trim()) return false;
  if (b.pros.length || b.cons.length || b.tags.length) return false;
  if (b.wouldOrderAgain !== null) return false;
  if (b.pillars.presentation || b.pillars.value_prop || b.pillars.execution) return false;
  if (b.pricePaid.trim()) return false;
  if (b.portionSize) return false;
  if (b.mealPeriod) return false;
  if (b.companyType) return false;
  if (b.visitedWith.trim()) return false;
  if (b.isAnonymous) return false;
  // `rating` defaults to 5 and `dateTasted` to today — neither alone is a
  // signal of intent, so we don't treat them as draft content.
  return true;
}

export function readComposeDraft(): ComposeDraftSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COMPOSE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ComposeDraftSnapshot;
    if (!parsed || typeof parsed !== 'object') return null;
    if (isEmptySnapshot(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeComposeDraft(snap: Omit<ComposeDraftSnapshot, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const full: ComposeDraftSnapshot = { ...snap, savedAt: Date.now() };
    if (isEmptySnapshot(full)) {
      window.localStorage.removeItem(COMPOSE_DRAFT_KEY);
      return;
    }
    window.localStorage.setItem(COMPOSE_DRAFT_KEY, JSON.stringify(full));
  } catch {
    /* localStorage may be unavailable (private mode, quota) — drafts just
       don't persist. The form still works. */
  }
}

export function clearComposeDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(COMPOSE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
