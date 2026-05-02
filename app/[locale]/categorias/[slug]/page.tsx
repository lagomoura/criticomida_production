import type { Metadata } from 'next';
import {
  getReviewCategoryLabelKey,
  isValidReviewCategorySlug,
} from '@/app/data/review-categories';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getRestaurants } from '@/app/lib/api/restaurants';
import { getCategories } from '@/app/lib/api/categories';
import { RestaurantListItem } from '@/app/lib/types';
import CategoryPageClient from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const tCategories = await getTranslations({ locale, namespace: 'categories' });

  if (!isValidReviewCategorySlug(slug)) {
    return { title: tCategories('notFound') + ' | CritiComida' };
  }

  const labelKey = getReviewCategoryLabelKey(slug)!.split('.')[1];
  const label = tCategories(labelKey);
  return {
    title: tCategories('metaTitle', { label }),
    description: tCategories('metaDescription', { label }),
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale } = await params;

  if (!isValidReviewCategorySlug(slug)) {
    notFound();
  }

  const tCategories = await getTranslations({ locale, namespace: 'categories' });
  const labelKey = getReviewCategoryLabelKey(slug)!.split('.')[1];
  const categoryLabel = tCategories(labelKey);

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
