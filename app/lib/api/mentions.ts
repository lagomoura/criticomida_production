import { fetchApi } from '@/app/lib/api/client';
import type { UserMentionSuggestion } from '@/app/lib/types/mention';

export async function searchMentionUsers(q: string): Promise<UserMentionSuggestion[]> {
  const trimmed = q.trim().replace(/^@/, '');
  if (!trimmed) return [];
  const params = new URLSearchParams({ q: trimmed, limit: '8' });
  return fetchApi<UserMentionSuggestion[]>(`/api/users/mention-search?${params.toString()}`);
}
