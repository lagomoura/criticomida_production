import { fetchApi } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ChatAgent = 'sommelier' | 'ghostwriter' | 'business';

export type ChatRole = 'user' | 'assistant' | 'tool';

export interface DishCardRestaurant {
  id: string;
  slug: string;
  name: string;
  location_name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  has_reservation: boolean;
  is_claimed: boolean;
}

export interface DishCardData {
  dish_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  rating: number | null;
  review_count: number;
  price_tier: string | null;
  restaurant: DishCardRestaurant;
  /** True when the authenticated comensal has already added this
   *  dish to their want-to-try list. Always present — ``false``
   *  for anonymous callers (the bookmark write would 401 anyway).
   *  The FE uses this to seed the chip's saved state so the label
   *  doesn't reset after a refresh. */
  want_to_try?: boolean;
}

export interface SearchDishesResult {
  count: number;
  dishes: DishCardData[];
  semantic_used: boolean;
}

export interface MapPayload {
  action: 'open_in_map';
  bbox?: { south: number; west: number; north: number; east: number };
  center?: { lat: number; lng: number; zoom?: number };
  dish_ids?: string[];
}

export interface CreateRouteResult {
  list_id: string;
  slug: string;
  name: string;
  description: string | null;
  is_public: boolean;
  public_url: string | null;
  dish_count: number;
  dish_ids: string[];
}

export interface ComparisonDishEntry {
  dish_id: string;
  name: string;
  cover_image_url: string | null;
  rating: number | null;
  review_count: number;
  price_tier: string | null;
  restaurant_name: string | null;
  restaurant_slug: string | null;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  /** Average per-pillar score (1-3 scale) across recent reviews.
   *  Null when no review of that dish has rated the pillar. */
  pillar_breakdown: {
    presentation: number | null;
    execution: number | null;
    value_prop: number | null;
  };
  /** Up to 2 most-mentioned pros / cons across recent reviews. */
  top_pros: string[];
  top_cons: string[];
  /** Mirrors ``DishCardData.want_to_try`` — server-side bookmark
   *  state. Always present; ``false`` when no auth context. */
  want_to_try?: boolean;
}

export interface ComparisonResult {
  comparison: true;
  count: number;
  dishes: ComparisonDishEntry[];
}

export interface ChatToolCall {
  id: string;
  name: string;
  arguments: string | null;
}

export interface ChatMessageData {
  id?: string;
  role: ChatRole;
  content: string | null;
  tool_calls?: ChatToolCall[] | null;
  tool_result?: {
    id: string;
    name: string;
    content: unknown;
    is_error: boolean;
  } | null;
  created_at?: string;
}

export interface ChatConversationSummary {
  id: string;
  agent: ChatAgent;
  title: string | null;
  started_at: string;
  last_message_at: string;
  restaurant_scope_id: string | null;
  /** ISO timestamp when the conversation was archived; ``null`` for
   *  active rows. Only present when the listing was requested with
   *  ``includeArchived=true``. */
  archived_at: string | null;
}

// ── streaming events emitted by /api/chat/stream ────────────────────────

export type StreamEvent =
  | { type: 'conversation'; data: { id: string; agent: ChatAgent } }
  | { type: 'text_delta'; data: string }
  | {
      type: 'tool_call_start';
      data: { id: string; name: string; input: Record<string, unknown> };
    }
  | {
      type: 'tool_call_result';
      data: {
        id: string;
        name: string;
        output: unknown;
        is_error: boolean;
      };
    }
  | { type: 'card'; data: { name: string; data: unknown } }
  | { type: 'error'; data: { message: string } | string }
  | { type: 'done'; data: null };

export interface StreamChatRequest {
  message: string;
  conversation_id?: string | null;
  agent?: ChatAgent;
  restaurant_scope_id?: string | null;
}

/**
 * Stream a chat turn via SSE.
 *
 * EventSource doesn't support POST + body, so we use fetch with a
 * ReadableStream and parse the SSE wire format manually. The async
 * generator yields one StreamEvent per `event:`/`data:` block.
 *
 * Caller controls cancellation via an AbortSignal.
 */
export async function* streamChat(
  body: StreamChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${BASE_URL}/api/chat/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody.detail || detail;
    } catch {
      /* not json */
    }
    throw new Error(`Chat stream failed: ${res.status} ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      let sep = buffer.indexOf('\n\n');
      while (sep !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const event = parseSseFrame(frame);
        if (event) yield event;
        sep = buffer.indexOf('\n\n');
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSseFrame(frame: string): StreamEvent | null {
  let dataLine = '';
  for (const raw of frame.split('\n')) {
    if (raw.startsWith('data:')) {
      dataLine += raw.slice(5).trimStart();
    }
  }
  if (!dataLine) return null;
  try {
    return JSON.parse(dataLine) as StreamEvent;
  } catch {
    return null;
  }
}

// ── conversations CRUD ────────────────────────────────────────────────────

export interface ListConversationsOptions {
  limit?: number;
  /** Restrict to conversations of one agent (e.g. ``business``). */
  agent?: ChatAgent;
  /** Restrict to conversations scoped to a specific restaurant. */
  restaurantScopeId?: string | null;
  /**
   * When ``true`` the backend includes archived conversations in the
   * listing (with ``archived_at`` set). Default is ``false`` so the
   * panel shows the active set only — the FE only opts in when the
   * "Mostrar archivadas" toggle is on.
   */
  includeArchived?: boolean;
}

export async function listMyConversations(
  options: ListConversationsOptions | number = {},
): Promise<ChatConversationSummary[]> {
  // Backwards compat: callers used to pass a bare ``limit`` number.
  // We accept that shape too and translate it into the new options
  // object — keeps existing call sites working without an audit.
  const opts: ListConversationsOptions =
    typeof options === 'number' ? { limit: options } : options;
  const params = new URLSearchParams();
  params.set('limit', String(opts.limit ?? 20));
  if (opts.agent) params.set('agent', opts.agent);
  if (opts.restaurantScopeId) {
    params.set('restaurant_scope_id', opts.restaurantScopeId);
  }
  if (opts.includeArchived) {
    params.set('include_archived', 'true');
  }
  return fetchApi<ChatConversationSummary[]>(
    `/api/chat/conversations/me?${params.toString()}`,
  );
}

export async function listConversationMessages(
  conversationId: string,
  limit = 100,
): Promise<ChatMessageData[]> {
  return fetchApi<ChatMessageData[]>(
    `/api/chat/conversations/${conversationId}/messages?limit=${limit}`,
  );
}

/**
 * Archive a conversation (soft-delete on the server).
 *
 * The backend route is still ``DELETE /api/chat/conversations/{id}``
 * for backwards compatibility, but the implementation marks
 * ``archived_at`` instead of removing rows. The conversation stays in
 * the DB and can be recovered if needed; ``listMyConversations`` skips
 * archived rows by default. ``deleteConversation`` is kept as a
 * deprecated alias to avoid breaking older call sites.
 */
export async function archiveConversation(
  conversationId: string,
): Promise<void> {
  await fetchApi<void>(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

/** @deprecated use ``archiveConversation`` — same endpoint, accurate name. */
export const deleteConversation = archiveConversation;

/**
 * Restore a previously archived conversation. Idempotent — calling it
 * on a non-archived conversation is a no-op on the server side.
 */
export async function unarchiveConversation(
  conversationId: string,
): Promise<void> {
  await fetchApi<void>(
    `/api/chat/conversations/${conversationId}/unarchive`,
    {
      method: 'POST',
    },
  );
}

/**
 * Permanently delete a conversation (and its messages). Distinct from
 * ``archiveConversation``: this can't be undone and is the right
 * primitive for GDPR / right-to-be-forgotten flows. The backend
 * gates it to the conversation's owner or an admin.
 */
export async function hardDeleteConversation(
  conversationId: string,
): Promise<void> {
  await fetchApi<void>(
    `/api/chat/conversations/${conversationId}/permanent`,
    {
      method: 'DELETE',
    },
  );
}

// ── Sommelier empty-state preview ────────────────────────────────────────

/**
 * Lightweight payload for the Sommelier empty state. Both nested
 * fields are nullable on purpose so the same shape covers anonymous
 * visitors and freshly-registered users with no profile inferred yet.
 */
export interface SommelierPreviewUser {
  display_name: string;
  handle: string | null;
}

export interface SommelierPreviewProfile {
  /** Raw enum value: ``presentation`` | ``execution`` | ``value_prop``. */
  dominant_pillar: string | null;
  /** Pre-translated Spanish label. The FE uses this for ``locale=es``. */
  dominant_pillar_label: string | null;
  top_neighborhoods: string[];
  top_categories: string[];
  favorite_tags: string[];
  /** User-declared dietary restrictions. Never inferred. */
  allergies: string[];
  /** Bucket: ``low`` / ``mid`` / ``high``, or null if not enough data. */
  avg_price_band: string | null;
}

export interface SommelierPreview {
  user: SommelierPreviewUser | null;
  profile: SommelierPreviewProfile | null;
}

/**
 * Fetch the empty-state preview for the Sommelier.
 *
 * The endpoint is auth-optional: anonymous callers receive
 * ``{user: null, profile: null}`` and the FE renders the sign-in
 * invitation. Logged-in users without a profile yet get
 * ``{user: {...}, profile: null}``. Cheap to call on every drawer
 * open — keep it lean.
 */
export async function getSommelierPreview(): Promise<SommelierPreview> {
  return fetchApi<SommelierPreview>('/api/chat/sommelier/preview');
}

// ── deprecated non-streaming entry — kept for parity with old callers ────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  const data = await fetchApi<{ response: string }>('/api/chat', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ message, history }),
  });
  return data.response;
}
