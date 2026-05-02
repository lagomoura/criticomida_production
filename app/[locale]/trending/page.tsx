import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import TrendingClient from './TrendingClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.trending' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function TrendingPage() {
  return (
    <main id="main-content">
      <TrendingClient />
    </main>
  );
}
