import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { ApiError } from '@/app/lib/api/client';
import OwnerDashboardClient from './OwnerDashboardClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Panel del restaurante · CritiComida',
  robots: { index: false, follow: false },
};

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
