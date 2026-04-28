import Link from 'next/link';
import { Fragment } from 'react';
import { cn } from '@/app/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  /** Omit href on the last (current) item. */
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Visual context: 'on-light' (default) or 'on-dark' for hero overlays. */
  tone?: 'on-light' | 'on-dark';
  className?: string;
}

export default function Breadcrumb({ items, tone = 'on-light', className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const baseColor = tone === 'on-dark' ? 'text-white/80' : 'text-text-muted';
  const linkHover = tone === 'on-dark' ? 'hover:text-white' : 'hover:text-text-primary';
  const currentColor = tone === 'on-dark' ? 'text-white' : 'text-text-primary';

  return (
    <nav aria-label="Migas de pan" className={cn('font-display text-sm italic', baseColor, className)}>
      <ol className="flex flex-wrap items-center gap-1.5 m-0 p-0 list-none">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <Fragment key={`${item.label}-${idx}`}>
              <li className="inline-flex">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'no-underline transition-colors',
                      linkHover,
                      'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] rounded-sm',
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={cn(isLast && currentColor)}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="select-none opacity-70">
                  ·
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
