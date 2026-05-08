import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import ComposeClient, { LoadingView } from './ComposeClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.compose' });
  return { title: t('title') };
}

export default function ComposePage() {
  return (
    <main id="main-content">
      <Suspense fallback={<LoadingView />}>
        <ComposeClient />
      </Suspense>
    </main>
  );
}
