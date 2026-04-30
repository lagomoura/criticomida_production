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
 * Sube una foto oficial del restaurant. Usa entity_type=restaurant_official_photo
 * para que NO aparezca en la galería pública (que filtra por restaurant_gallery);
 * solo se renderiza prioritaria en el hero a través de la tabla
 * restaurant_official_photos.
 */
export async function uploadRestaurantImage(
  file: File,
  restaurantId: string,
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('entity_type', 'restaurant_official_photo');
  form.append('entity_id', restaurantId);
  const result = await fetchApi<{ url: string }>('/api/images/upload', {
    method: 'POST',
    body: form,
  });
  return result.url;
}
