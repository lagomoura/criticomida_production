---
name: No free-text entity names — siempre Google Places
description: Restaurantes y platos nunca se crean desde texto libre. Usar Google Places API para resolver el establecimiento, ciudad, location, lat/lng.
type: feedback
originSessionId: b590f4d9-de97-4c1c-a725-8cafca7f28a5
---
Regla: **restaurants y dishes nunca se aceptan como texto libre del usuario**. La fuente de verdad para nombre, ciudad, dirección, coordenadas y `google_place_id` es la Google Places API. Lo mismo para la ciudad cuando implementemos Trending.

**Why:** Evita duplicados ("Güerrin" vs "guerrin" vs "Guerrín"), asegura ciudad y lat/lng confiables para features geográficas (Trending por ciudad, mapas, proximidad), y permite enriquecer restaurants con datos de Google (teléfono, website, horarios, foto) al crearlos. El script `backend/scripts/import_google_maps.py` ya sigue este patrón — los 85 restaurants actuales vinieron por ese camino.

**How to apply:**

- **Compose social (`/compose`)**: el form actual tiene `<Input>` de texto libre para `restaurantName` y `dishName`. **Hay que refactorearlo** a un autocomplete que consulte Google Places (restaurant) + luego autocomplete de dishes de ese restaurant (una vez elegido). Si el dish no existe, crearlo bajo ese restaurant; el restaurant sí o sí viene de un `place_id` resuelto.
- **Legacy `POST /api/posts`**: actualmente hace `find_or_create_restaurant` por nombre lowercase — eso tolera free text. Mantener la lógica interna de `find_or_create` pero el input externo debe ser un `google_place_id`, no un nombre libre. Nuevo schema sugerido: `PostCreate` con `restaurant: { place_id: str, ... }` en vez de `restaurant_name: str`.
- **Trending por ciudad**: usar Google Places para extraer `locality` del `google_place_id` ya guardado en `restaurants`. No parsear `location_name` con regex heurísticas.
- **Admin tools / imports**: siempre vienen de Google Places. No hay paths para crear restaurants manualmente desde UI.

**Cuándo aplicar:** antes de habilitar que usuarios reales publiquen. El compose social actual no está listo para usuarios reales hasta que tenga el autocomplete de Places. Por ahora funciona bien con mocks o con data ya importada por el script oficial.
