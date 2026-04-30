import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { ApiError } from '@/app/lib/api/client';
import ClaimFormClient from './ClaimFormClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Reclamar restaurante · CritiComida',
  description:
    'Reclamá la ficha de tu restaurante para responder reseñas y subir fotos oficiales.',
  robots: { index: false, follow: false },
};

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
