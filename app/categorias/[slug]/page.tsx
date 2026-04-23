import type { Metadata } from 'next';
import {
  getReviewCategoryLabel,
  isValidReviewCategorySlug,
} from '@/app/data/review-categories';
import { notFound } from 'next/navigation';
import { getRestaurants } from '@/app/lib/api/restaurants';
import { getCategories } from '@/app/lib/api/categories';
import { RestaurantListItem } from '@/app/lib/types';
import CategoryPageClient from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidReviewCategorySlug(slug)) {
    return { title: 'Categoría no encontrada | Criticomida' };
  }

  const label = getReviewCategoryLabel(slug);
  return {
    title: `${label} | Restaurantes | Criticomida`,
    description: `Restaurantes y reseñas en la categoría ${label} en Criticomida.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  if (!isValidReviewCategorySlug(slug)) {
    notFound();
  }

  const categoryLabel = getReviewCategoryLabel(slug);

  let restaurants: RestaurantListItem[] = [];
  try {
    const result = await getRestaurants({ category_slug: slug, per_page: 100 });
    restaurants = result.items ?? [];
  } catch {
    restaurants = [];
  }

  let categoryId: number | null = null;
  try {
    const categories = await getCategories();
    const found = categories.find(c => c.slug === slug);
    categoryId = found?.id ?? null;
  } catch {
    categoryId = null;
  }

  return (
    <CategoryPageClient
      categorySlug={slug}
      categoryLabel={categoryLabel}
      categoryId={categoryId}
      initialRestaurants={restaurants}
    />
  );
}
