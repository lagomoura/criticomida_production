import type { Comment, CursorPage, ReviewPost } from '@/app/lib/types/social';
import { mockGetAllPosts } from './feed';

const BASE_TIME = new Date('2026-04-22T14:30:00-03:00').getTime();
const ago = (seconds: number) => new Date(BASE_TIME - seconds * 1000).toISOString();

/** Defaults aplicados a todo mock para mantener `Comment` shape completo. */
function mockComment(partial: Omit<Comment,
  'parentCommentId' | 'repliesCount' | 'likesCount' | 'viewerLiked'
>): Comment {
  return {
    parentCommentId: null,
    repliesCount: 0,
    likesCount: 0,
    viewerLiked: false,
    ...partial,
  };
}

/**
 * Deterministic mock comment bank keyed by post id. Falls back to a generic
 * set for posts without explicit entries so every review page is populated.
 */
const COMMENTS_BY_POST: Record<string, Comment[]> = {
  'rev-001': [
    mockComment({
      id: 'cmt-001',
      reviewId: 'rev-001',
      createdAt: ago(60 * 5),
      updatedAt: ago(60 * 5),
      author: { id: 'user-juli', displayName: 'Juli Mendes', handle: 'julipicacomida' },
      text: '¿Cuánto picante? Soy ñoña con el chile.',
      canReport: true,
    }),
    mockComment({
      id: 'cmt-002',
      reviewId: 'rev-001',
      createdAt: ago(60 * 3),
      updatedAt: ago(60 * 3),
      author: { id: 'user-mica', displayName: 'Mica Fernández', handle: 'micacomelona' },
      text: 'Picante tolerable, se siente pero no tapa el sabor del tare. Si aguantás un curry medio, lo disfrutás.',
      canDelete: true,
      canEdit: true,
    }),
    mockComment({
      id: 'cmt-003',
      reviewId: 'rev-001',
      createdAt: ago(60 * 1),
      updatedAt: ago(60 * 1),
      author: { id: 'user-dani', displayName: 'Daniel López', handle: 'danicome' },
      text: 'Me sumo a probarlo el sábado.',
      canReport: true,
    }),
  ],
  'rev-004': [
    mockComment({
      id: 'cmt-010',
      reviewId: 'rev-004',
      createdAt: ago(60 * 60 * 6),
      updatedAt: ago(60 * 60 * 6),
      author: { id: 'user-lucia', displayName: 'Lucía Romero', handle: 'lucia_r' },
      text: 'Güerrin sigue siendo Güerrin. La fugazzeta también vale la pena.',
      canReport: true,
    }),
    mockComment({
      id: 'cmt-011',
      reviewId: 'rev-004',
      createdAt: ago(60 * 60 * 5),
      updatedAt: ago(60 * 60 * 5),
      author: { id: 'user-caro', displayName: 'Carolina R.', handle: null },
      text: 'La cola del lunes al mediodía es un despropósito pero sí, vale.',
      canReport: true,
    }),
  ],
};

const GENERIC_COMMENTS: Comment[] = [
  mockComment({
    id: 'cmt-generic-01',
    reviewId: '__placeholder__',
    createdAt: ago(60 * 30),
    updatedAt: ago(60 * 30),
    author: { id: 'user-ana', displayName: 'Ana Paula', handle: 'anapaulacome' },
    text: 'Me lo anoto para la semana que viene.',
    canReport: true,
  }),
  mockComment({
    id: 'cmt-generic-02',
    reviewId: '__placeholder__',
    createdAt: ago(60 * 15),
    updatedAt: ago(60 * 15),
    author: { id: 'user-tomi', displayName: 'Tomás Echeverría', handle: 'tomiplatos' },
    text: 'Buen dato, gracias.',
    canReport: true,
  }),
];

export function mockGetPost(id: string): ReviewPost | null {
  return mockGetAllPosts().find((p) => p.id === id) ?? null;
}

export function mockGetComments(postId: string): CursorPage<Comment> {
  const specific = COMMENTS_BY_POST[postId];
  if (specific) {
    return { items: specific, nextCursor: null };
  }
  return {
    items: GENERIC_COMMENTS.map((c) => ({ ...c, reviewId: postId })),
    nextCursor: null,
  };
}

let nextCommentSeq = 1;

export function mockCreateComment(postId: string, text: string): Comment {
  const now = new Date().toISOString();
  return mockComment({
    id: `cmt-local-${Date.now()}-${nextCommentSeq++}`,
    reviewId: postId,
    createdAt: now,
    updatedAt: now,
    author: {
      id: 'user-self-mock',
      displayName: 'Vos',
      handle: null,
      avatarUrl: null,
    },
    text,
    canDelete: true,
    canEdit: true,
  });
}
