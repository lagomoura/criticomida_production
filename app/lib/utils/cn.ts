type ClassValue = string | number | null | false | undefined;

/** Minimal clsx-like joiner for conditional classnames. */
export function cn(...values: ClassValue[]): string {
  let out = '';
  for (const v of values) {
    if (!v) continue;
    out += out ? ' ' + v : v;
  }
  return out;
}
