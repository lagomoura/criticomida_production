import { fetchApi } from './client';

/** Closed enum of chat languages the Sommelier can pin. */
export type ChatLanguage = 'es' | 'en' | 'pt';

/** Closed enum of editorial response styles the comensal can pin. */
export type ChatResponseStyle = 'editorial' | 'concise' | 'warm';

/**
 * Persistent chat preferences for the comensal — both fields
 * nullable so the comensal can opt in / out without us needing a
 * "clear" flag in the API.
 */
export interface UserChatPreference {
  language_preference: ChatLanguage | null;
  response_style: ChatResponseStyle | null;
}

/**
 * Full ``UserTasteProfile`` view. Inferred fields are read-only on
 * the FE; only ``allergies`` and ``preferred_hours`` are user-
 * declared and editable from the form.
 */
export interface TasteProfileRead {
  dominant_pillar: string | null;
  top_neighborhoods: string[];
  top_categories: string[];
  favorite_tags: string[];
  avg_price_band: string | null;
  preferred_hours: number[];
  allergies: string[];
  updated_at: string | null;
}

export interface TasteProfileUpdate {
  allergies: string[];
  preferred_hours: number[];
}

export async function getMyChatPreferences(): Promise<UserChatPreference> {
  return fetchApi<UserChatPreference>('/api/users/me/chat-preferences');
}

export async function updateMyChatPreferences(
  payload: UserChatPreference,
): Promise<UserChatPreference> {
  return fetchApi<UserChatPreference>('/api/users/me/chat-preferences', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getMyTasteProfile(): Promise<TasteProfileRead> {
  return fetchApi<TasteProfileRead>('/api/users/me/taste-profile');
}

export async function updateMyTasteProfile(
  payload: TasteProfileUpdate,
): Promise<TasteProfileRead> {
  return fetchApi<TasteProfileRead>('/api/users/me/taste-profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
