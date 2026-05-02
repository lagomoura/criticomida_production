import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SearchClient from './SearchClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.search' });
  return { title: t('title') };
}

export default function SearchPage() {
  return (
    <main id="main-content">
      <SearchClient />
    </main>
  );
}
