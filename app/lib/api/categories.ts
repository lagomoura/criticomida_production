import { fetchApi } from './client';
import { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/api/categories');
}

export async function createCategory(data: {
  name: string;
  slug: string;
  image_url?: string;
  display_order?: number;
}): Promise<Category> {
  return fetchApi<Category>('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
