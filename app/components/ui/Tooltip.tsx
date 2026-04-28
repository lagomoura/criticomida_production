'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/app/lib/utils/cn';

type Side = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  label: ReactNode;
  /** Side relative to the trigger. Default 'top'. */
  side?: Side;
  /** Delay before showing (ms). Default 250ms — feels responsive without being noisy. */
  delay?: number;
  children: ReactElement;
}

const sideClass: Record<Side, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

export default function Tooltip({ label, side = 'top', delay = 250, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setOpen(false);
  }, []);

  if (!isValidElement(children)) return children;

  const triggerProps = (children.props ?? {}) as Record<string, unknown>;
  const cloned = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (e: unknown) => {
      (triggerProps.onMouseEnter as ((ev: unknown) => void) | undefined)?.(e);
      show();
    },
    onMouseLeave: (e: unknown) => {
      (triggerProps.onMouseLeave as ((ev: unknown) => void) | undefined)?.(e);
      hide();
    },
    onFocus: (e: unknown) => {
      (triggerProps.onFocus as ((ev: unknown) => void) | undefined)?.(e);
      show();
    },
    onBlur: (e: unknown) => {
      (triggerProps.onBlur as ((ev: unknown) => void) | undefined)?.(e);
      hide();
    },
  });

  return (
    <span className="relative inline-flex">
      {cloned}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md px-2 py-1 font-sans text-xs font-medium',
            'bg-text-primary text-text-inverse shadow-[var(--shadow-elevated)]',
            'motion-safe:animate-[tooltip-in_140ms_var(--ease-standard)]',
            sideClass[side],
          )}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes tooltip-in {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
