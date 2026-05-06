import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import MapaClient from './MapaClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.mapa' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function MapaPage() {
  // ``MapaClient`` calls ``useSearchParams`` to pick up
  // ?lat=&lng=&zoom= from the chat deep link. Next 15 requires the
  // hook to be wrapped in a Suspense boundary so the page can be
  // statically prerendered (the boundary lets the search params
  // hydrate on the client without poisoning the static shell).
  return (
    <main id="main-content" className="cc-container py-4">
      <Suspense fallback={null}>
        <MapaClient />
      </Suspense>
    </main>
  );
}
