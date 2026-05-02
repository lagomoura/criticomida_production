/**
 * Canonical review category slugs (URLs /categorias/[slug] and home filters).
 * Labels are translated via the `categories` namespace; the keys here are
 * stable and never change.
 */
export const REVIEW_CATEGORIES = [
  { slug: 'dulces', labelKey: 'categories.dulces' },
  { slug: 'brunchs', labelKey: 'categories.brunchs' },
  { slug: 'desayunos', labelKey: 'categories.desayunos' },
  { slug: 'mexico-food', labelKey: 'categories.mexicoFood' },
  { slug: 'japan-food', labelKey: 'categories.japanFood' },
  { slug: 'arabic-food', labelKey: 'categories.arabicFood' },
  { slug: 'israelfood', labelKey: 'categories.israelFood' },
  { slug: 'thaifood', labelKey: 'categories.thaiFood' },
  { slug: 'koreanfood', labelKey: 'categories.koreanFood' },
  { slug: 'chinafood', labelKey: 'categories.chinaFood' },
  { slug: 'parrillas', labelKey: 'categories.parrillas' },
  { slug: 'brazilfood', labelKey: 'categories.brazilFood' },
  { slug: 'burguers', labelKey: 'categories.burguers' },
  { slug: 'helados', labelKey: 'categories.helados' },
  { slug: 'peru-food', labelKey: 'categories.peruFood' },
] as const;

export type ReviewCategorySlug = (typeof REVIEW_CATEGORIES)[number]['slug'];

const SLUG_SET = new Set<string>(
  REVIEW_CATEGORIES.map((entry) => entry.slug),
);

export function isValidReviewCategorySlug(
  slug: string,
): slug is ReviewCategorySlug {
  return SLUG_SET.has(slug);
}

export function getReviewCategoryLabelKey(slug: string): string | null {
  const found = REVIEW_CATEGORIES.find((c) => c.slug === slug);
  return found?.labelKey ?? null;
}

/** Filter UI: includes a synthetic "all" option whose label key resolves to
 * the localized "All" string. */
export const reviewCategoryFilterOptions = [
  { labelKey: 'categories.all', value: 'all' as const },
  ...REVIEW_CATEGORIES.map((c) => ({
    labelKey: c.labelKey,
    value: c.slug,
  })),
];
