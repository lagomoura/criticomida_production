import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PreferencesClient from './PreferencesClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'metadata.preferences',
  });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PreferencesPage() {
  return (
    <main id="main-content" className="cc-container py-8">
      <PreferencesClient />
    </main>
  );
}
