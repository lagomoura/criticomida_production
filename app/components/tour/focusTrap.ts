/**
 * Focus trap mínimo para el tooltip card del tour: Tab cicla entre
 * los elementos focusables del card y Shift+Tab cicla en sentido
 * inverso. Sin librería — son ~30 líneas y evitamos arrastrar
 * @radix-ui/focus-scope solo para esto.
 *
 * Devuelve una función de cleanup. Si el contenedor no tiene
 * elementos focusables, el trap es un no-op (el ESC sigue saliendo
 * del tour porque lo maneja el overlay).
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement): () => void {
  const getFocusable = (): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
    );

  // Foco inicial al primer elemento del card.
  const initial = getFocusable();
  if (initial.length > 0) {
    initial[0].focus();
  } else {
    // Si no hay nada focusable, mover foco al container mismo para
    // que ESC funcione cuando el usuario pulsa cualquier tecla.
    container.setAttribute('tabindex', '-1');
    container.focus();
  }

  const handler = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener('keydown', handler, true);
  return () => document.removeEventListener('keydown', handler, true);
}
