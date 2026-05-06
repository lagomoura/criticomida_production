import { fetchApi } from './client';
import { Category } from '../types';

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
}

export type CategoryUpdatePayload = Partial<CategoryPayload>;

export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/api/categories');
}

export async function createCategory(data: CategoryPayload): Promise<Category> {
  return fetchApi<Category>('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  slug: string,
  data: CategoryUpdatePayload,
): Promise<Category> {
  return fetchApi<Category>(`/api/categories/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(slug: string): Promise<void> {
  await fetchApi<void>(`/api/categories/${slug}`, {
    method: 'DELETE',
  });
}
