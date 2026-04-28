'use client';

import { useCallback, useState } from 'react';
import { followUser, unfollowUser } from '../api/users';
import { useToast } from '../../components/ui/Toast';

export interface UseFollowToggleResult {
  loading: boolean;
  toggle: (userId: string, next: boolean) => Promise<boolean>;
}

/**
 * Standalone follow/unfollow with a loading flag. Returns the finalized state
 * (true = now following), letting the parent reconcile its own UI. On API
 * failure emits an error toast so the user sees that the toggle didn't stick.
 * Consumers own the displayed counter; this hook only drives the API call.
 */
export function useFollowToggle(): UseFollowToggleResult {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const toggle = useCallback(
    async (userId: string, next: boolean) => {
      setLoading(true);
      try {
        if (next) await followUser(userId);
        else await unfollowUser(userId);
        return next;
      } catch {
        toast.error(
          next ? 'No se pudo seguir' : 'No se pudo dejar de seguir',
          'Probá de nuevo en un momento.',
        );
        return !next;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  return { loading, toggle };
}
