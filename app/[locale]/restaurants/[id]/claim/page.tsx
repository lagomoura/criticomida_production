import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { ApiError } from '@/app/lib/api/client';
import ClaimFormClient from './ClaimFormClient';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.claim' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
  };
}

export default async function ClaimRestaurantPage({ params }: PageProps) {
  const { id: slug } = await params;

  let restaurant;
  try {
    restaurant = await getRestaurant(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <main id="main-content">
      <ClaimFormClient
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        restaurantLocation={restaurant.location_name}
        isAlreadyClaimed={Boolean(restaurant.is_claimed)}
      />
    </main>
  );
}
