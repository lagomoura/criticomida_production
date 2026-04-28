'use client';

import { useCallback, useState } from 'react';
import { likePost, unlikePost, savePost, unsavePost } from '../api/interactions';
import { useToast } from '../../components/ui/Toast';
import type { ReviewPost } from '../types/social';

export interface UsePostsInteractionResult {
  posts: ReviewPost[];
  setPosts: (next: ReviewPost[] | ((prev: ReviewPost[]) => ReviewPost[])) => void;
  toggleLike: (postId: string, next: boolean) => Promise<void>;
  toggleSave: (postId: string, next: boolean) => Promise<void>;
  prependPost: (post: ReviewPost) => void;
}

/**
 * Owns a mutable list of posts plus the optimistic toggles for like/save.
 * On API failure, rolls the list state back to the pre-click value and emits
 * a toast so the user knows the action didn't persist.
 *
 * Consumers: FeedClient, PublicProfileClient, DishDetailClient,
 * ReviewDetailClient (single-item list).
 */
export function usePostsInteraction(initial: ReviewPost[] = []): UsePostsInteractionResult {
  const [posts, setPosts] = useState<ReviewPost[]>(initial);
  const toast = useToast();

  const toggleLike = useCallback(
    async (postId: string, next: boolean) => {
      setPosts((prev) => prev.map((p) => (p.id === postId ? applyLike(p, next) : p)));
      try {
        if (next) await likePost(postId);
        else await unlikePost(postId);
      } catch {
        setPosts((prev) => prev.map((p) => (p.id === postId ? applyLike(p, !next) : p)));
        toast.error(
          next ? 'No se pudo dar like' : 'No se pudo quitar el like',
          'Probá de nuevo en un momento.',
        );
      }
    },
    [toast],
  );

  const toggleSave = useCallback(
    async (postId: string, next: boolean) => {
      setPosts((prev) => prev.map((p) => (p.id === postId ? applySave(p, next) : p)));
      try {
        if (next) await savePost(postId);
        else await unsavePost(postId);
      } catch {
        setPosts((prev) => prev.map((p) => (p.id === postId ? applySave(p, !next) : p)));
        toast.error(
          next ? 'No se pudo guardar' : 'No se pudo quitar de guardados',
          'Probá de nuevo en un momento.',
        );
      }
    },
    [toast],
  );

  const prependPost = useCallback((post: ReviewPost) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  return { posts, setPosts, toggleLike, toggleSave, prependPost };
}

function applyLike(post: ReviewPost, next: boolean): ReviewPost {
  if (post.viewerState.liked === next) return post;
  return {
    ...post,
    viewerState: { ...post.viewerState, liked: next },
    stats: { ...post.stats, likes: post.stats.likes + (next ? 1 : -1) },
  };
}

function applySave(post: ReviewPost, next: boolean): ReviewPost {
  if (post.viewerState.saved === next) return post;
  return {
    ...post,
    viewerState: { ...post.viewerState, saved: next },
    stats: { ...post.stats, saves: post.stats.saves + (next ? 1 : -1) },
  };
}
