import { fetchApi } from './client';
import { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/api/categories');
}
