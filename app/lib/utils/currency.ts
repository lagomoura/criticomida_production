/** Helpers para formatear precios cuando la moneda viene del restaurante.
 *
 * `currencyCode` es ISO 4217 (ARS / BRL / USD / ...) y puede ser null cuando
 * el restaurante todavía no tiene la moneda seteada — ese caso degrada a un
 * símbolo genérico `$` con el número crudo, sin Intl currency. */

const SYMBOL_OVERRIDES: Record<string, string> = {
  ARS: '$',
  BRL: 'R$',
  USD: 'US$',
};

/** Símbolo corto para pintar en adornments de inputs y labels.
 * Para casos no listados arriba devolvemos `$` — el `Intl.NumberFormat`
 * cuando se renderice un valor concreto le va a poner el símbolo correcto. */
export function formatCurrencySymbol(
  currencyCode: string | null | undefined,
): string {
  if (!currencyCode) return '$';
  const upper = currencyCode.toUpperCase();
  return SYMBOL_OVERRIDES[upper] ?? '$';
}

export interface FormatCurrencyOptions {
  /** Decimales fraccionarios. Default 0 (precios redondos). */
  maximumFractionDigits?: number;
  /** Mostrar signo `+`/`-`. Útil para deltas. Default false. */
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/** Formato amigable. Cuando `currencyCode` es null cae a número local con
 * un prefijo `$` para no mentir sobre la moneda. */
export function formatCurrency(
  value: number,
  currencyCode: string | null | undefined,
  locale: string,
  opts: FormatCurrencyOptions = {},
): string {
  const { maximumFractionDigits = 0, signDisplay = 'auto' } = opts;
  if (currencyCode) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode.toUpperCase(),
        maximumFractionDigits,
        signDisplay,
      }).format(value);
    } catch {
      // ICU no conoce el código → caer al fallback genérico.
    }
  }
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    signDisplay,
  }).format(value);
  return `$${formatted}`;
}
