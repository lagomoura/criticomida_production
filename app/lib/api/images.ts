import { fetchApi } from './client';

/**
 * Sube una imagen al backend y devuelve su URL.
 * `entity_type='dish_cover'` con `entity_id=<dishId>` deja la imagen
 * disponible para asignar como `Dish.cover_image_url`.
 */
export async function uploadDishCoverImage(file: File, dishId: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('entity_type', 'dish_cover');
  form.append('entity_id', dishId);
  const result = await fetchApi<{ url: string }>('/api/images/upload', {
    method: 'POST',
    body: form,
  });
  return result.url;
}

/**
 * Sube una imagen y la asocia al gallery del restaurant. El owner luego la
 * registra como foto oficial vía /api/restaurants/{slug}/official-photos.
 */
export async function uploadRestaurantImage(
  file: File,
  restaurantId: string,
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('entity_type', 'restaurant_gallery');
  form.append('entity_id', restaurantId);
  const result = await fetchApi<{ url: string }>('/api/images/upload', {
    method: 'POST',
    body: form,
  });
  return result.url;
}
