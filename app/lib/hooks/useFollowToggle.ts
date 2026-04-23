'use client';

import { useCallback, useState } from 'react';
import { followUser, unfollowUser } from '../api/users';

export interface UseFollowToggleResult {
  loading: boolean;
  toggle: (userId: string, next: boolean) => Promise<boolean>;
}

/**
 * Standalone follow/unfollow with a loading flag. Returns the finalized state
 * (true = now following), letting the parent reconcile its own UI.
 * Consumers own the displayed counter; this hook only drives the API call.
 */
export function useFollowToggle(): UseFollowToggleResult {
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async (userId: string, next: boolean) => {
    setLoading(true);
    try {
      if (next) await followUser(userId);
      else await unfollowUser(userId);
      return next;
    } catch {
      // Parent should invert any optimistic UI it applied.
      return !next;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, toggle };
}
