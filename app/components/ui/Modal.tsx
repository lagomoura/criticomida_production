'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Position = 'center' | 'bottom-sheet';

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
  /**
   * Layout position. Default 'center' is the classic centered dialog. Set
   * 'bottom-sheet' to slide up from the bottom on mobile (one-handed reach
   * for the title and X) and fall back to centered on sm+ viewports where
   * thumb zone is no longer the constraint.
   */
  position?: Position;
  /** Disable closing on overlay click + ESC (use during in-flight mutations). */
  busy?: boolean;
  /** Hide the X button in the header. */
  hideCloseButton?: boolean;
  /**
   * Optional eyebrow text rendered above the title in Azafrán uppercase.
   * Matches the kicker pattern from PublishReviewModal. Only rendered when present.
   */
  kicker?: string;
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
  position = 'center',
  busy = false,
  hideCloseButton = false,
  kicker,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tCommon = useTranslations('common');

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

  const isSheet = position === 'bottom-sheet';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center',
        // Bottom-sheet on mobile, fall back to centered on sm+ where the
        // viewport is wide enough that thumb zone stops mattering.
        isSheet ? 'items-end p-0 sm:items-center sm:p-4' : 'items-center p-4',
      )}
      role="presentation"
    >
      <button
        type="button"
        aria-label={tCommon('closeDialog')}
        onClick={safeClose}
        disabled={busy}
        className="absolute inset-0 cursor-default bg-color-espresso/55 backdrop-blur-md transition-opacity disabled:cursor-not-allowed"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative z-10 flex w-full flex-col overscroll-contain border border-border-default bg-surface-card',
          isSheet
            ? 'rounded-t-3xl border-b-0 sm:rounded-2xl sm:border-b'
            : 'rounded-2xl',
          isSheet
            ? 'max-h-[94dvh] sm:max-h-[calc(100dvh-2rem)]'
            : 'max-h-[calc(100dvh-2rem)]',
          'shadow-[var(--shadow-floating)]',
          isSheet
            ? 'motion-safe:animate-[cc-modal-sheet-up_320ms_var(--ease-spoon)] sm:motion-safe:animate-[modal-in_240ms_var(--ease-spoon)]'
            : 'motion-safe:animate-[modal-in_240ms_var(--ease-spoon)]',
          sizeClass[size],
          className,
        )}
      >
        {isSheet && (
          <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-border-default" aria-hidden />
          </div>
        )}
        <div
          className={cn(
            'flex shrink-0 items-start gap-3 px-6 pt-6 pb-4',
            hideTitle && 'sr-only',
          )}
        >
          <div className="flex-1">
            {kicker && (
              <p className="mb-1 font-sans text-[10.5px] font-semibold uppercase tracking-[0.22em] text-color-terracota">
                {kicker}
              </p>
            )}
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
              aria-label={tCommon('close')}
              className={cn(
                'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                'text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                'disabled:opacity-50',
              )}
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden />
            </button>
          )}
        </div>

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto px-6 pb-6',
            hideTitle && 'pt-6',
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border-subtle px-6 py-4"
            style={
              isSheet
                ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }
                : undefined
            }
          >
            {footer}
          </div>
        )}
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
