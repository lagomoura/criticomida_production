import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getReviewCategoryLabelKey } from '@/app/data/review-categories';
import { getRestaurants } from '@/app/lib/api/restaurants';
import { getCategories } from '@/app/lib/api/categories';
import { Category, RestaurantListItem } from '@/app/lib/types';
import CategoryPageClient from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function resolveLabel(
  slug: string,
  fallback: string,
  locale: string,
): Promise<string> {
  const labelKey = getReviewCategoryLabelKey(slug);
  if (!labelKey) return fallback;
  const tCategories = await getTranslations({ locale, namespace: 'categories' });
  const key = labelKey.split('.')[1];
  return tCategories(key) || fallback;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const tCategories = await getTranslations({ locale, namespace: 'categories' });

  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  const match = categories.find((c) => c.slug === slug);
  if (!match) {
    return { title: tCategories('notFound') + ' | CritiComida' };
  }

  const label = await resolveLabel(slug, match.name, locale);
  return {
    title: tCategories('metaTitle', { label }),
    description: tCategories('metaDescription', { label }),
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale } = await params;

  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  const match = categories.find((c) => c.slug === slug);
  if (!match) {
    notFound();
  }

  const categoryLabel = await resolveLabel(slug, match.name, locale);

  let restaurants: RestaurantListItem[] = [];
  try {
    const result = await getRestaurants({ category_slug: slug, per_page: 100 });
    restaurants = result.items ?? [];
  } catch {
    restaurants = [];
  }

  return (
    <CategoryPageClient
      categorySlug={slug}
      categoryLabel={categoryLabel}
      initialRestaurants={restaurants}
    />
  );
}
