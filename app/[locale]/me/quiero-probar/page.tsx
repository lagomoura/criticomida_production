import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import WantToTryClient from './WantToTryClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.wantToTry' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function WantToTryPage() {
  return (
    <main id="main-content">
      <WantToTryClient />
    </main>
  );
}
