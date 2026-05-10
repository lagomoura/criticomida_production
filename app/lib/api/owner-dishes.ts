import { fetchApi } from './client';
import type {
  DishCoverState,
  DishPhotoCandidatesResponse,
} from '../types/owner-content';

/**
 * Promueve una URL ya subida a foto oficial del plato. La URL puede venir de:
 *   - una subida fresca vía `uploadDishCoverImage`
 *   - una foto UGC ya existente (devuelta por `listDishPhotoCandidates`)
 *
 * Idempotente: pisa el cover anterior, incluyendo auto-asignaciones del cron.
 */
export async function setDishCover(
  slug: string,
  dishId: string,
  url: string,
): Promise<DishCoverState> {
  return fetchApi<DishCoverState>(
    `/api/restaurants/${slug}/dishes/${dishId}/cover`,
    {
      method: 'PUT',
      body: JSON.stringify({ url }),
    },
  );
}

/** Vuelve al fallback del frontend (review más reciente con foto). */
export async function clearDishCover(
  slug: string,
  dishId: string,
): Promise<void> {
  await fetchApi<void>(`/api/restaurants/${slug}/dishes/${dishId}/cover`, {
    method: 'DELETE',
  });
}

/**
 * Lista las fotos UGC del plato (fotos subidas en reviews) para alimentar el
 * picker del owner. Ordenadas por rating de la review desc.
 */
export async function listDishPhotoCandidates(
  slug: string,
  dishId: string,
): Promise<DishPhotoCandidatesResponse> {
  return fetchApi<DishPhotoCandidatesResponse>(
    `/api/restaurants/${slug}/dishes/${dishId}/photo-candidates`,
  );
}
