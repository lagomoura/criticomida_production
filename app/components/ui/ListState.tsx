import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';
import Button from './Button';
import EmptyState, { type EmptyStateProps } from './EmptyState';

export type ListStateStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface ListStateProps {
  status: ListStateStatus;
  /** Skeleton to render while loading. Build with SkeletonPresets. */
  skeleton: ReactNode;
  /** Empty state shown when status === 'empty'. */
  empty: EmptyStateProps;
  /** Error message shown when status === 'error'. */
  errorMessage?: string;
  /** Optional retry handler for error state. */
  onRetry?: () => void;
  /** Children rendered when status === 'ready'. */
  children: ReactNode;
}

/**
 * Centralizes the four states every list surface needs (search, trending,
 * saved, notifications, etc.). Parents pass a `status` and matching slots
 * for skeleton + empty copy; children render only when ready.
 */
export default function ListState({
  status,
  skeleton,
  empty,
  errorMessage = 'No pudimos cargar los resultados. Probá de nuevo en un momento.',
  onRetry,
  children,
}: ListStateProps) {
  if (status === 'loading') return <>{skeleton}</>;

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="mb-2 h-5 w-5 text-action-danger"
          aria-hidden
        />
        <p className="mb-3 m-0 font-sans text-sm text-text-secondary">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Intentar de nuevo
          </Button>
        )}
      </div>
    );
  }

  if (status === 'empty') {
    return <EmptyState {...empty} />;
  }

  return <>{children}</>;
}
