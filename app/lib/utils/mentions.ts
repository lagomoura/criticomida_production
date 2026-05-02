/**
 * Helpers para parseo y resolución de @mentions en comentarios y reseñas.
 *
 * Sintaxis: `@handle` anclado a inicio de línea o whitespace para evitar
 * matchear emails (`foo@bar`). Handle: 1-30 alfanuméricos + underscore.
 */

export const MENTION_REGEX = /(^|\s)@([a-zA-Z0-9_]{1,30})\b/g;

/** Devuelve los handles únicos referenciados en el texto. */
export function extractHandles(text: string): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    seen.add(match[2]);
  }
  return Array.from(seen);
}

export type MentionToken =
  | { type: 'text'; value: string }
  | { type: 'mention'; value: string; handle: string };

/**
 * Parte el texto en una secuencia de tokens de texto y mención. Cada token
 * 'mention' incluye el `value` completo (`@handle` con su prefijo no consumido)
 * para que el renderer pueda decidir el ancho del link.
 */
export function tokenizeMentions(text: string): MentionToken[] {
  if (!text) return [];
  const tokens: MentionToken[] = [];
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const [, prefix, handle] = match;
    const atIndex = match.index + prefix.length;
    if (atIndex > cursor) {
      tokens.push({ type: 'text', value: text.slice(cursor, atIndex) });
    }
    tokens.push({ type: 'mention', value: `@${handle}`, handle });
    cursor = atIndex + 1 + handle.length;
  }
  if (cursor < text.length) {
    tokens.push({ type: 'text', value: text.slice(cursor) });
  }
  return tokens;
}

/**
 * Dado el texto, un `Map<handle, userId>` con los picks confirmados, y el ID
 * del usuario actual, devuelve los IDs únicos a notificar (filtra self y
 * handles no resueltos).
 */
export function resolveMentionedUserIds(
  text: string,
  picked: Map<string, string>,
  selfId: string | null,
): string[] {
  const handles = extractHandles(text);
  const ids = new Set<string>();
  for (const handle of handles) {
    const userId = picked.get(handle);
    if (!userId) continue;
    if (selfId && userId === selfId) continue;
    ids.add(userId);
  }
  return Array.from(ids);
}
