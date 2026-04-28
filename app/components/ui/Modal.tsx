'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hide title visually but keep it for screen readers. */
  hideTitle?: boolean;
  description?: string;
  children: ReactNode;
  /** Optional footer node rendered below the body (e.g., action buttons). */
  footer?: ReactNode;
  size?: Size;
  /** Disable closing on overlay click + ESC (use during in-flight mutations). */
  busy?: boolean;
  /** Hide the X button in the header. */
  hideCloseButton?: boolean;
  className?: string;
}

const sizeClass: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  size = 'md',
  busy = false,
  hideCloseButton = false,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const safeClose = useCallback(() => {
    if (!busy) onClose();
  }, [busy, onClose]);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = (document.activeElement as HTMLElement) ?? null;

    const focusFirst = () => {
      const node = dialogRef.current;
      if (!node) return;
      const target =
        node.querySelector<HTMLElement>('[autofocus]') ??
        node.querySelector<HTMLElement>(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"]), [href]',
        );
      target?.focus();
    };
    const id = window.requestAnimationFrame(focusFirst);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        safeClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const node = dialogRef.current;
      if (!node) return;
      const focusables = node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      window.cancelAnimationFrame(id);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open, safeClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Cerrar diálogo"
        onClick={safeClose}
        disabled={busy}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative z-10 w-full overscroll-contain rounded-2xl border border-border-default bg-surface-card p-6',
          'shadow-[var(--shadow-floating)] motion-safe:animate-[modal-in_240ms_var(--ease-spoon)]',
          sizeClass[size],
          className,
        )}
      >
        <div className={cn('mb-4 flex items-start gap-3', hideTitle && 'sr-only')}>
          <div className="flex-1">
            <h2
              id={titleId}
              className="m-0 font-display text-2xl font-medium leading-tight text-text-primary"
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 m-0 font-sans text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && !hideTitle && (
            <button
              type="button"
              onClick={safeClose}
              disabled={busy}
              aria-label="Cerrar"
              className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                'text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                'disabled:opacity-50',
              )}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden />
            </button>
          )}
        </div>

        <div>{children}</div>

        {footer && <div className="mt-5 flex flex-wrap items-center justify-end gap-2">{footer}</div>}
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
