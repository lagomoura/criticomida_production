import Link from 'next/link';
import { Fragment } from 'react';
import { tokenizeMentions } from '@/app/lib/utils/mentions';
import type { MentionRef } from '@/app/lib/types/social';

export interface MentionTextProps {
  text: string;
  /** Cuando el backend ship-ea menciones resueltas, se prefieren para mostrar
   * el displayName aunque el handle haya cambiado. */
  mentions?: MentionRef[];
  className?: string;
}

/**
 * Renderiza texto con `@handle` como links a `/u/{handle}`. Tokeniza a nodos
 * React (nunca `dangerouslySetInnerHTML`), por lo que es XSS-safe por construcción.
 */
export default function MentionText({ text, mentions, className }: MentionTextProps) {
  const handleByName = new Map<string, MentionRef>();
  if (mentions) {
    for (const m of mentions) handleByName.set(m.handle.toLowerCase(), m);
  }
  const tokens = tokenizeMentions(text);

  if (className) {
    return (
      <span className={className}>
        {tokens.map((token, i) => renderToken(token, i, handleByName))}
      </span>
    );
  }
  return (
    <>
      {tokens.map((token, i) => renderToken(token, i, handleByName))}
    </>
  );
}

function renderToken(
  token: ReturnType<typeof tokenizeMentions>[number],
  index: number,
  resolved: Map<string, MentionRef>,
) {
  if (token.type === 'text') {
    return <Fragment key={index}>{token.value}</Fragment>;
  }
  const ref = resolved.get(token.handle.toLowerCase());
  return (
    <Link
      key={index}
      href={`/u/${token.handle}`}
      title={ref?.displayName}
      className="font-medium text-action-primary hover:underline"
    >
      {token.value}
    </Link>
  );
}
