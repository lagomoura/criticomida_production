'use client';

import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '@/app/lib/utils/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  value: string;
  items: TabItem[];
  onChange: (next: string) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Horizontal tablist with underline indicator. Keyboard-navigable
 * (ArrowLeft/ArrowRight + Home/End) per the WAI-ARIA tabs pattern.
 */
export default function Tabs({ value, items, onChange, ariaLabel, className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!items.length) return;
    const idx = items.findIndex((i) => i.value === value);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;
    e.preventDefault();
    onChange(items[next].value);
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${items[next].value}"]`);
      el?.focus();
    });
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-center gap-1 border-b border-border-default',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-tab={item.value}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative inline-flex min-h-[44px] items-center gap-1.5 px-3 font-sans text-sm transition-colors',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span className="font-sans text-xs tabular-nums text-text-muted">{item.count}</span>
            )}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-action-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
