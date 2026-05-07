/**
 * Canonical review category slugs (URLs /categorias/[slug] and home filters).
 * Labels are translated via the `categories` namespace; the keys here are
 * stable and never change.
 *
 * Lista alineada con `SEED_CATEGORIES` de `backend/app/routers/admin.py` y
 * con la lista cerrada de slugs en
 * `backend/app/services/chat/prompts/sommelier.md`.
 */
export const REVIEW_CATEGORIES = [
  // Sudamérica
  { slug: 'argentina', labelKey: 'categories.argentina' },
  { slug: 'brasilena', labelKey: 'categories.brasilena' },
  { slug: 'peruana', labelKey: 'categories.peruana' },
  { slug: 'uruguaya', labelKey: 'categories.uruguaya' },
  { slug: 'venezolana', labelKey: 'categories.venezolana' },
  { slug: 'colombiana', labelKey: 'categories.colombiana' },
  { slug: 'chilena', labelKey: 'categories.chilena' },
  { slug: 'boliviana', labelKey: 'categories.boliviana' },
  // Centroamérica / Caribe
  { slug: 'mexicana', labelKey: 'categories.mexicana' },
  { slug: 'cubana', labelKey: 'categories.cubana' },
  { slug: 'caribena', labelKey: 'categories.caribena' },
  // Norteamérica
  { slug: 'burgers', labelKey: 'categories.burgers' },
  { slug: 'estadounidense', labelKey: 'categories.estadounidense' },
  // Europa
  { slug: 'italiana', labelKey: 'categories.italiana' },
  { slug: 'espanola', labelKey: 'categories.espanola' },
  { slug: 'francesa', labelKey: 'categories.francesa' },
  { slug: 'griega', labelKey: 'categories.griega' },
  { slug: 'alemana', labelKey: 'categories.alemana' },
  { slug: 'portuguesa', labelKey: 'categories.portuguesa' },
  // Medio Oriente / Norte de África
  { slug: 'arabe', labelKey: 'categories.arabe' },
  { slug: 'israeli', labelKey: 'categories.israeli' },
  { slug: 'libanesa', labelKey: 'categories.libanesa' },
  { slug: 'turca', labelKey: 'categories.turca' },
  { slug: 'marroqui', labelKey: 'categories.marroqui' },
  { slug: 'armenia', labelKey: 'categories.armenia' },
  // Asia
  { slug: 'japonesa', labelKey: 'categories.japonesa' },
  { slug: 'china', labelKey: 'categories.china' },
  { slug: 'coreana', labelKey: 'categories.coreana' },
  { slug: 'thai', labelKey: 'categories.thai' },
  { slug: 'vietnamita', labelKey: 'categories.vietnamita' },
  { slug: 'india', labelKey: 'categories.india' },
  // Carnes
  { slug: 'parrilla', labelKey: 'categories.parrilla' },
  { slug: 'steakhouse', labelKey: 'categories.steakhouse' },
  // Mariscos
  { slug: 'mariscos', labelKey: 'categories.mariscos' },
  // Estilos
  { slug: 'brunchs', labelKey: 'categories.brunchs' },
  { slug: 'desayunos', labelKey: 'categories.desayunos' },
  { slug: 'tapas', labelKey: 'categories.tapas' },
  { slug: 'picadas', labelKey: 'categories.picadas' },
  { slug: 'sandwiches', labelKey: 'categories.sandwiches' },
  { slug: 'empanadas', labelKey: 'categories.empanadas' },
  { slug: 'bowls', labelKey: 'categories.bowls' },
  { slug: 'vegano', labelKey: 'categories.vegano' },
  { slug: 'vegetariano', labelKey: 'categories.vegetariano' },
  { slug: 'sin-tacc', labelKey: 'categories.sinTacc' },
  // Dulce / Café / Bebida
  { slug: 'dulces', labelKey: 'categories.dulces' },
  { slug: 'helados', labelKey: 'categories.helados' },
  { slug: 'pasteleria', labelKey: 'categories.pasteleria' },
  { slug: 'panaderia', labelKey: 'categories.panaderia' },
  { slug: 'cafeteria', labelKey: 'categories.cafeteria' },
  { slug: 'bar', labelKey: 'categories.bar' },
  { slug: 'cerveceria', labelKey: 'categories.cerveceria' },
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
