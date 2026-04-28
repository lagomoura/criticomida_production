'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCircleExclamation,
  faCircleInfo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/app/lib/utils/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss in ms. 0 disables. Default 4500ms. */
  duration?: number;
  /** Optional inline action (single CTA). */
  action?: { label: string; onClick: () => void };
}

interface ToastEntry extends Required<Pick<ToastOptions, 'title' | 'variant' | 'duration'>> {
  id: number;
  description?: string;
  action?: ToastOptions['action'];
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => number;
  success: (title: string, description?: string) => number;
  error: (title: string, description?: string) => number;
  info: (title: string, description?: string) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = nextId++;
      const entry: ToastEntry = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? 'info',
        duration: opts.duration ?? 4500,
        action: opts.action,
      };
      setItems((prev) => [...prev, entry]);
      if (entry.duration > 0) {
        const handle = setTimeout(() => dismiss(id), entry.duration);
        timers.current.set(id, handle);
      }
      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'success' }),
    [toast],
  );
  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'error', duration: 6500 }),
    [toast],
  );
  const info = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'info' }),
    [toast],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((handle) => clearTimeout(handle));
      map.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, success, error, info, dismiss }),
    [toast, success, error, info, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof faCheck; iconClass: string; barClass: string; ariaRole: 'status' | 'alert' }
> = {
  success: {
    icon: faCheck,
    iconClass: 'text-action-secondary',
    barClass: 'bg-action-secondary',
    ariaRole: 'status',
  },
  error: {
    icon: faCircleExclamation,
    iconClass: 'text-action-danger',
    barClass: 'bg-action-danger',
    ariaRole: 'alert',
  },
  info: {
    icon: faCircleInfo,
    iconClass: 'text-action-primary',
    barClass: 'bg-action-primary',
    ariaRole: 'status',
  },
};

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastEntry[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end"
    >
      {items.map((t) => (
        <ToastCard key={t.id} entry={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: (id: number) => void;
}) {
  const cfg = variantConfig[entry.variant];
  return (
    <div
      role={cfg.ariaRole}
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-border-default bg-surface-card',
        'shadow-[var(--shadow-floating)] motion-safe:animate-[toast-in_280ms_var(--ease-spoon)]',
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', cfg.barClass)} />
      <div className="flex items-start gap-3 py-3 pl-5 pr-3">
        <FontAwesomeIcon icon={cfg.icon} aria-hidden className={cn('mt-0.5 text-base', cfg.iconClass)} />
        <div className="flex-1 min-w-0">
          <p className="m-0 font-sans text-sm font-medium text-text-primary">{entry.title}</p>
          {entry.description && (
            <p className="mt-0.5 m-0 font-sans text-xs text-text-muted">{entry.description}</p>
          )}
          {entry.action && (
            <button
              type="button"
              onClick={() => {
                entry.action?.onClick();
                onDismiss(entry.id);
              }}
              className="mt-1.5 font-sans text-xs font-semibold text-action-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {entry.action.label}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(entry.id)}
          aria-label="Cerrar notificación"
          className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden className="text-xs" />
        </button>
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ToastProvider;
