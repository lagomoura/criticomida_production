import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { ApiError } from '@/app/lib/api/client';
import OwnerDashboardClient from './OwnerDashboardClient';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.ownerDashboard' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function OwnerDashboardPage({ params }: PageProps) {
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
      <OwnerDashboardClient
        restaurantSlug={restaurant.slug}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        restaurantLocation={restaurant.location_name}
      />
    </main>
  );
}
