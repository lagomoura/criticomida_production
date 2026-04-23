import type { ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * Empty feed, empty search, no notifications, etc.
 * Per brand voice: direct copy, no celebrations.
 */
export default function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="mb-1 text-text-muted">
          {icon}
        </span>
      )}
      <h2 className="font-display text-2xl font-medium text-text-primary">{title}</h2>
      {description && (
        <p className="max-w-md font-sans text-sm leading-relaxed text-text-muted">{description}</p>
      )}
      {action && (
        <div className="mt-2">
          {action.href ? (
            <a href={action.href}>
              <Button variant="primary" size="md">
                {action.label}
              </Button>
            </a>
          ) : (
            <Button variant="primary" size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
