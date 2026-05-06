'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const MENTION_RE = /(?<![A-Za-z0-9_])@([A-Za-z0-9_]{1,30})/g;

export interface MentionTextProps {
  text: string;
}

/**
 * Renders plain text and turns each `@handle` into a link to the user's
 * profile. Mirrors the backend regex at
 * `backend/app/services/mention_service.py` — keep them in sync if the
 * charset/length ever changes.
 */
export default function MentionText({ text }: MentionTextProps) {
  const locale = useLocale();
  const segments: Array<string | { handle: string; raw: string }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(MENTION_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push(text.slice(lastIndex, start));
    }
    segments.push({ handle: match[1], raw: match[0] });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return (
    <>
      {segments.map((seg, i) =>
        typeof seg === 'string' ? (
          <Fragment key={i}>{seg}</Fragment>
        ) : (
          <Link
            key={i}
            href={`/${locale}/u/${seg.handle.toLowerCase()}`}
            className="font-medium text-action-primary hover:underline"
          >
            {seg.raw}
          </Link>
        ),
      )}
    </>
  );
}
