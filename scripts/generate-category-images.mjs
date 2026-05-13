#!/usr/bin/env node
/**
 * Generate one editorial food-photography image per review category.
 *
 * Output: public/img/categories/{slug}.jpg  (51 files, 16:9 landscape).
 *
 * Two ways to run this:
 *
 *  A) Via fal.ai REST API (no MCP needed). Requires FAL_KEY env var:
 *       export FAL_KEY=...    # from https://fal.ai/dashboard/keys
 *       node scripts/generate-category-images.mjs
 *
 *  B) Via the fal-ai MCP from inside Claude Code (preferred when iterating
 *     prompts interactively). The skill `fal-ai-media` documents the tool
 *     calls; this file is then just the canonical prompt table — paste each
 *     prompt into `generate(app_id: "fal-ai/nano-banana-2", input_data: {…})`
 *     and download the resulting URL to public/img/categories/{slug}.jpg.
 *
 * Prompt style: overhead editorial food photography, terracotta-accent palette,
 * shallow DoF, no text/logos. Matches Palato brand v2.1.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'public', 'img', 'categories');

const PROMPT_SUFFIX =
  ', on rustic wood table, natural daylight, editorial Bon Appétit style, ' +
  'shallow depth of field, earthy color palette with terracotta accents, ' +
  'shot on Canon R5 85mm, food magazine quality, no text, no logos';

/** slug → iconic dish (in English, for prompt quality). */
export const CATEGORY_PROMPTS = [
  ['argentina',     'Overhead food photography of Argentine asado with chimichurri and grilled provoleta'],
  ['brasilena',     'Overhead food photography of Brazilian feijoada with rice, orange slices and farofa'],
  ['peruana',       'Overhead food photography of Peruvian ceviche with leche de tigre, choclo and cancha'],
  ['uruguaya',      'Overhead food photography of Uruguayan chivito sandwich cut in half with fries'],
  ['venezolana',    'Overhead food photography of Venezuelan arepas reina pepiada with avocado filling'],
  ['colombiana',    'Overhead food photography of Colombian bandeja paisa with beans, chicharrón, arepa and fried egg'],
  ['chilena',       'Overhead food photography of Chilean empanadas de pino with pebre sauce'],
  ['boliviana',     'Overhead food photography of Bolivian salteñas with savory beef filling'],
  ['mexicana',      'Overhead food photography of Mexican tacos al pastor with pineapple, cilantro and lime'],
  ['cubana',        'Overhead food photography of Cuban ropa vieja with white rice and fried plantains'],
  ['caribena',      'Overhead food photography of Caribbean rice with pigeon peas and grilled plantains'],
  ['burgers',       'Overhead food photography of a smash cheeseburger with crispy fries and pickles'],
  ['estadounidense','Overhead food photography of American BBQ pulled pork plate with coleslaw and cornbread'],
  ['italiana',      'Overhead food photography of Italian cacio e pepe pasta with cracked black pepper'],
  ['espanola',      'Overhead food photography of Spanish seafood paella in iron pan with mussels and prawns'],
  ['francesa',      'Overhead food photography of French coq au vin with mushrooms and pearl onions'],
  ['griega',        'Overhead food photography of Greek souvlaki plate with pita, tzatziki and Greek salad'],
  ['alemana',       'Overhead food photography of German schnitzel with potato salad and lemon wedge'],
  ['portuguesa',    'Overhead food photography of Portuguese bacalhau à brás with olives and parsley'],
  ['arabe',         'Overhead food photography of Middle Eastern mezze platter with hummus, baba ganoush and warm pita'],
  ['israeli',       'Overhead food photography of Israeli falafel plate with hummus, tahini and chopped salad'],
  ['libanesa',      'Overhead food photography of Lebanese mezze with kibbeh, tabbouleh and labneh'],
  ['turca',         'Overhead food photography of Turkish lamb kebab plate with rice pilaf and grilled tomato'],
  ['marroqui',      'Overhead food photography of Moroccan lamb tagine in clay pot with couscous'],
  ['armenia',       'Overhead food photography of Armenian khorovats grilled meats with lavash and herbs'],
  ['japonesa',      'Overhead food photography of Japanese sushi and sashimi platter with soy and wasabi'],
  ['china',         'Overhead food photography of Chinese dim sum in bamboo steamers with dipping sauces'],
  ['coreana',       'Overhead food photography of Korean bibimbap in stone bowl with vegetables and egg'],
  ['thai',          'Overhead food photography of Thai pad thai with shrimp, lime and crushed peanuts'],
  ['vietnamita',    'Overhead food photography of Vietnamese pho noodle soup with herbs and lime'],
  ['india',         'Overhead food photography of Indian butter chicken with naan and basmati rice'],
  ['parrilla',      'Overhead food photography of mixed Argentine parrilla with steak, chorizo and morcilla'],
  ['steakhouse',    'Overhead food photography of a thick ribeye steak with grill marks and herb butter'],
  ['mariscos',      'Overhead food photography of fresh seafood platter with oysters, prawns, clams and lemon'],
  ['brunchs',       'Overhead food photography of brunch spread with eggs benedict, pancakes and fresh juice'],
  ['desayunos',     'Overhead food photography of breakfast plate with eggs, sourdough toast, fruit and coffee'],
  ['tapas',         'Overhead food photography of Spanish tapas spread with patatas bravas, croquetas and olives'],
  ['picadas',       'Overhead food photography of Argentine picada board with cheeses, cured meats and bread'],
  ['sandwiches',    'Overhead food photography of gourmet pressed sandwich cut in half with crispy fries'],
  ['empanadas',     'Overhead food photography of assorted golden baked empanadas with chimichurri'],
  ['bowls',         'Overhead food photography of colorful grain bowl with quinoa, salmon, avocado and greens'],
  ['vegano',        'Overhead food photography of vegan buddha bowl with roasted vegetables, chickpeas and tahini'],
  ['vegetariano',   'Overhead food photography of vegetarian plate with grilled vegetables, halloumi and grains'],
  ['sin-tacc',      'Overhead food photography of gluten-free plate with grilled chicken, quinoa and roasted vegetables'],
  ['dulces',        'Overhead food photography of assorted plated desserts with chocolate, berries and cream'],
  ['helados',       'Overhead food photography of artisan ice cream scoops in waffle cone with toppings'],
  ['pasteleria',    'Overhead food photography of French pastries assortment with eclairs, tarts and macarons'],
  ['panaderia',     'Overhead food photography of rustic sourdough bread loaves on wooden board with butter'],
  ['cafeteria',     'Overhead food photography of espresso with latte art and a buttery croissant'],
  ['bar',           'Overhead food photography of craft cocktails on bar with citrus garnish and ice'],
  ['cerveceria',    'Overhead food photography of craft beer flight with charcuterie board'],
];

const APP_ID = 'fal-ai/nano-banana-2';
const FAL_REST = `https://fal.run/${APP_ID}`;

async function generateOne(slug, prompt) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY env var not set');

  const res = await fetch(FAL_REST, {
    method: 'POST',
    headers: {
      Authorization: `Key ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${prompt}${PROMPT_SUFFIX}`,
      image_size: 'landscape_16_9',
      num_images: 1,
    }),
  });
  if (!res.ok) throw new Error(`fal ${slug}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error(`fal ${slug}: no image url in response`);

  const img = await fetch(url);
  if (!img.ok) throw new Error(`download ${slug}: ${img.status}`);
  const buf = Buffer.from(await img.arrayBuffer());
  const path = resolve(OUT_DIR, `${slug}.jpg`);
  await writeFile(path, buf);
  return path;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const targets = args.length
    ? CATEGORY_PROMPTS.filter(([s]) => args.includes(s))
    : CATEGORY_PROMPTS;

  console.log(`Generating ${targets.length} category images → ${OUT_DIR}`);
  for (const [slug, prompt] of targets) {
    try {
      const out = await generateOne(slug, prompt);
      console.log(`  ✓ ${slug} → ${out}`);
    } catch (err) {
      console.error(`  ✗ ${slug}:`, err.message);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
