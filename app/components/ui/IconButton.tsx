import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

export type IconButtonIntent = 'like' | 'save' | 'follow' | 'neutral';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: ReactNode;
  ariaLabel: string;
  intent?: IconButtonIntent;
  selected?: boolean;
  loading?: boolean;
  count?: number;
}

/**
 * - Hit area 44×44 (meets WCAG 2.5.5 AAA).
 * - When `count` is set, renders a compact inline count to the right.
 * - `selected` applies the intent color to the icon/surface.
 * - `aria-pressed` is set for toggle intents (like, save, follow).
 */
export default function IconButton({
  icon,
  ariaLabel,
  intent = 'neutral',
  selected = false,
  loading = false,
  disabled,
  count,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const isToggle = intent !== 'neutral';
  const selectedClasses = selectedClassesFor(intent, selected);
  const isDisabled = disabled || loading;
  // Micro-interacción especiería: cualquier intent toggleable hace pop al
  // pasar a 'selected'. Antes solo aplicaba a 'like'.
  const shouldPop = isToggle && selected;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-pressed={isToggle ? selected : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-2 text-sm transition-colors',
        'hover:bg-surface-subtle active:opacity-85',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        selectedClasses,
        className,
      )}
    >
      <span
        aria-hidden
        key={`${intent}-${selected ? 'on' : 'off'}`}
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center',
          shouldPop && 'cc-pop-on-select',
        )}
      >
        {loading ? <Spinner /> : icon}
      </span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'font-sans text-xs tabular-nums',
            selected && intent !== 'neutral'
              ? 'text-[currentColor]'
              : 'text-text-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Cuando un toggle está seleccionado, además del color del icono pintamos un
 * fondo "encendido" (color pale del token) — el botón se siente activo, no
 * solo "marcado". Cuando no está seleccionado: muted neutro.
 */
function selectedClassesFor(intent: IconButtonIntent, selected: boolean): string {
  if (!selected) return 'text-text-muted';
  switch (intent) {
    case 'like':
      return 'text-[var(--state-like-on)] bg-[color:var(--color-terracota-pale)] hover:bg-[color:var(--color-terracota-pale)]';
    case 'save':
      return 'text-[var(--state-save-on)] bg-[color:var(--color-terracota-pale)] hover:bg-[color:var(--color-terracota-pale)]';
    case 'follow':
      return 'text-[var(--state-follow-on)] bg-[color:var(--color-dorado-pale)] hover:bg-[color:var(--color-dorado-pale)]';
    default:
      return 'text-text-primary';
  }
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
