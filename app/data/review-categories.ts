/**
 * Canonical review category slugs (URLs /categorias/[slug] and home filters).
 * Keep in sync with review cards on the home page.
 */
export const REVIEW_CATEGORIES = [
  { slug: 'dulces', label: 'Dulces' },
  { slug: 'brunchs', label: 'Brunchs' },
  { slug: 'desayunos', label: 'Desayunos' },
  { slug: 'mexico-food', label: 'Mexicana' },
  { slug: 'japan-food', label: 'Japonesa' },
  { slug: 'arabic-food', label: 'Árabe' },
  { slug: 'israelfood', label: 'Israelí' },
  { slug: 'thaifood', label: 'Tailandesa' },
  { slug: 'koreanfood', label: 'Coreana' },
  { slug: 'chinafood', label: 'China' },
  { slug: 'parrillas', label: 'Parrilla' },
  { slug: 'brazilfood', label: 'Brasileña' },
  { slug: 'burguers', label: 'Hamburguesas' },
  { slug: 'helados', label: 'Helados' },
  { slug: 'peru-food', label: 'Peruana' },
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

export function getReviewCategoryLabel(slug: string): string {
  const found = REVIEW_CATEGORIES.find((c) => c.slug === slug);
  return found?.label ?? slug;
}

/** Options for the home reviews filter UI (includes “all”). */
export const reviewCategoryFilterOptions = [
  { label: 'Todas', value: 'all' as const },
  ...REVIEW_CATEGORIES.map((c) => ({
    label: c.label,
    value: c.slug,
  })),
];
