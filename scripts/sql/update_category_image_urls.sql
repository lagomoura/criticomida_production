-- Update `categories.image_url` for the 36 slugs whose hero image we
-- regenerated and bundled at `public/img/categories/{slug}.jpg`.
--
-- Idempotent: only rows currently pointing at the ephemeral fal.media CDN
-- are rewritten — rows with persistent local paths (`/img/xxxfood.jpg`)
-- or other hosts are left untouched.
--
-- Run on dev:
--   docker exec -i backend-db-1 psql -U criticomida -d criticomida \
--     < scripts/sql/update_category_image_urls.sql
--
-- Run on Railway (prod), from a session connected to the public Postgres URL:
--   psql "$RAILWAY_DATABASE_URL" -f scripts/sql/update_category_image_urls.sql

BEGIN;

UPDATE categories AS c
SET image_url = v.new_url
FROM (VALUES
  ('argentina',      '/img/categories/argentina.jpg'),
  ('uruguaya',       '/img/categories/uruguaya.jpg'),
  ('venezolana',     '/img/categories/venezolana.jpg'),
  ('colombiana',     '/img/categories/colombiana.jpg'),
  ('chilena',        '/img/categories/chilena.jpg'),
  ('boliviana',      '/img/categories/boliviana.jpg'),
  ('cubana',         '/img/categories/cubana.jpg'),
  ('caribena',       '/img/categories/caribena.jpg'),
  ('estadounidense', '/img/categories/estadounidense.jpg'),
  ('italiana',       '/img/categories/italiana.jpg'),
  ('espanola',       '/img/categories/espanola.jpg'),
  ('francesa',       '/img/categories/francesa.jpg'),
  ('griega',         '/img/categories/griega.jpg'),
  ('alemana',        '/img/categories/alemana.jpg'),
  ('portuguesa',     '/img/categories/portuguesa.jpg'),
  ('libanesa',       '/img/categories/libanesa.jpg'),
  ('turca',          '/img/categories/turca.jpg'),
  ('marroqui',       '/img/categories/marroqui.jpg'),
  ('armenia',        '/img/categories/armenia.jpg'),
  ('vietnamita',     '/img/categories/vietnamita.jpg'),
  ('india',          '/img/categories/india.jpg'),
  ('steakhouse',     '/img/categories/steakhouse.jpg'),
  ('mariscos',       '/img/categories/mariscos.jpg'),
  ('tapas',          '/img/categories/tapas.jpg'),
  ('picadas',        '/img/categories/picadas.jpg'),
  ('sandwiches',     '/img/categories/sandwiches.jpg'),
  ('empanadas',      '/img/categories/empanadas.jpg'),
  ('bowls',          '/img/categories/bowls.jpg'),
  ('vegano',         '/img/categories/vegano.jpg'),
  ('vegetariano',    '/img/categories/vegetariano.jpg'),
  ('sin-tacc',       '/img/categories/sin-tacc.jpg'),
  ('pasteleria',     '/img/categories/pasteleria.jpg'),
  ('panaderia',      '/img/categories/panaderia.jpg'),
  ('cafeteria',      '/img/categories/cafeteria.jpg'),
  ('bar',            '/img/categories/bar.jpg'),
  ('cerveceria',     '/img/categories/cerveceria.jpg')
) AS v(slug, new_url)
WHERE c.slug = v.slug
  AND c.image_url LIKE '%fal.media%';

-- Sanity check: list updated rows.
SELECT slug, image_url
FROM categories
WHERE slug IN (
  'argentina','uruguaya','venezolana','colombiana','chilena','boliviana',
  'cubana','caribena','estadounidense','italiana','espanola','francesa',
  'griega','alemana','portuguesa','libanesa','turca','marroqui','armenia',
  'vietnamita','india','steakhouse','mariscos','tapas','picadas','sandwiches',
  'empanadas','bowls','vegano','vegetariano','sin-tacc','pasteleria',
  'panaderia','cafeteria','bar','cerveceria'
)
ORDER BY slug;

COMMIT;
