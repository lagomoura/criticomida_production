/**
 * Suggest review-category slugs from the data the user has already entered.
 * The compose flow uses these to render 3-5 chip suggestions inside the
 * "Agregar detalles" collapse, replacing the visual fricción of a 52-item
 * native <select>. The full list stays accessible via "Ver todas".
 *
 * Three signals are combined with priority dish > restaurant > name:
 *   1. The dish detail (when the user picked an existing dish that already
 *      has a canonical category).
 *   2. The restaurant's categories (when surfaced by the backend — stub
 *      today; `ComposeRestaurant` doesn't yet carry them).
 *   3. Keyword matching on the dish name against a small synonyms table.
 *
 * Pure functions, no React, no IO. Suitable for `useMemo` in client code.
 */
import { REVIEW_CATEGORIES, type ReviewCategorySlug } from '@/app/data/review-categories';

const SLUG_SET = new Set<string>(REVIEW_CATEGORIES.map((c) => c.slug));

/** Keyword → slug seed. Keep this list narrow and high-precision: false
 * positives here become visible chips that look stupid. Only obvious matches.
 * Spanish/Portuguese/English mix because dish names in our catalog are
 * multilingual. Lowercased; matched word-boundary-style with includes. */
const KEYWORD_TO_SLUG: ReadonlyArray<{ slug: ReviewCategorySlug; keywords: ReadonlyArray<string> }> = [
  { slug: 'italiana', keywords: ['pizza', 'pasta', 'spaghetti', 'lasagna', 'lasaña', 'ravioli', 'fettuccine', 'risotto', 'gnocchi', 'ñoqui', 'noqui', 'tiramisu'] },
  { slug: 'japonesa', keywords: ['sushi', 'sashimi', 'ramen', 'nigiri', 'maki', 'temaki', 'gyoza', 'tempura', 'donburi', 'udon'] },
  { slug: 'mexicana', keywords: ['taco', 'tacos', 'burrito', 'quesadilla', 'enchilada', 'guacamole', 'nachos', 'fajitas'] },
  { slug: 'burgers', keywords: ['burger', 'hamburguesa', 'cheeseburger', 'smashburger', 'smash burger'] },
  { slug: 'peruana', keywords: ['ceviche', 'lomo saltado', 'tiradito', 'anticucho', 'ají de gallina', 'aji de gallina'] },
  { slug: 'parrilla', keywords: ['parrilla', 'asado', 'bife', 'ojo de bife', 'entraña', 'entrana', 'vacio', 'vacío', 'chorizo'] },
  { slug: 'mariscos', keywords: ['mariscos', 'camarón', 'camarones', 'langostinos', 'pulpo', 'calamares'] },
  { slug: 'china', keywords: ['chow mein', 'dim sum', 'wonton', 'kung pao'] },
  { slug: 'thai', keywords: ['pad thai', 'tom yum', 'pad see ew', 'panang'] },
  { slug: 'india', keywords: ['curry', 'tikka masala', 'biryani', 'naan', 'samosa'] },
  { slug: 'arabe', keywords: ['shawarma', 'falafel', 'hummus', 'kebab', 'kibbeh'] },
  { slug: 'espanola', keywords: ['paella', 'tortilla española', 'gazpacho', 'jamón ibérico'] },
  { slug: 'sandwiches', keywords: ['sandwich', 'sándwich', 'sanguche', 'wrap', 'milanesa napolitana'] },
  { slug: 'empanadas', keywords: ['empanada', 'empanadas'] },
  { slug: 'bowls', keywords: ['poke', 'poké', 'buddha bowl', 'grain bowl'] },
  { slug: 'helados', keywords: ['helado', 'gelato', 'sorbete'] },
  { slug: 'pasteleria', keywords: ['tarta', 'cheesecake', 'brownie', 'macaron', 'eclair'] },
  { slug: 'panaderia', keywords: ['pan', 'medialuna', 'baguette', 'focaccia', 'croissant'] },
  { slug: 'cafeteria', keywords: ['cappuccino', 'latte', 'flat white', 'espresso', 'cortado'] },
  { slug: 'desayunos', keywords: ['waffle', 'pancake', 'panqueque', 'tostada francesa', 'french toast'] },
  { slug: 'vegano', keywords: ['vegano', 'vegan'] },
  { slug: 'vegetariano', keywords: ['vegetariano', 'vegetarian'] },
  { slug: 'sin-tacc', keywords: ['sin tacc', 'gluten free', 'sin gluten'] },
];

/** Best-effort minimal interface: anything with an optional `category`. Keeps
 * the import surface here tiny and decoupled from the chatbot/dish detail
 * shape that lives in another module. */
export interface CategorizableDish {
  category?: string | null;
}

export function inferCategoriesFromDish(detail: CategorizableDish | null | undefined): string[] {
  if (!detail?.category) return [];
  return SLUG_SET.has(detail.category) ? [detail.category] : [];
}

/** Stub: `ComposeRestaurant` / `SelectedPlace` don't expose dominant categories
 * today. When the backend starts surfacing them on the place payload, plumb
 * them through and return them here. Returning [] is the safe no-op. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function inferCategoriesFromRestaurant(place: unknown): string[] {
  return [];
}

export function inferCategoriesFromDishName(name: string): string[] {
  const n = name.trim().toLowerCase();
  if (n.length < 3) return [];
  const matches: string[] = [];
  for (const entry of KEYWORD_TO_SLUG) {
    if (entry.keywords.some((kw) => n.includes(kw))) {
      matches.push(entry.slug);
    }
  }
  return matches;
}

/**
 * Combine the three sources with priority dish > restaurant > name. Dedupes,
 * caps at 5, and only emits slugs that exist in the canonical set so a stale
 * keyword can never produce a broken chip.
 */
export function mergeCategorySuggestions(
  dishCats: string[],
  restaurantCats: string[],
  nameCats: string[],
  max = 5,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (slugs: string[]) => {
    for (const slug of slugs) {
      if (!SLUG_SET.has(slug)) continue;
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push(slug);
      if (out.length >= max) return true;
    }
    return false;
  };
  if (push(dishCats)) return out;
  if (push(restaurantCats)) return out;
  push(nameCats);
  return out;
}
