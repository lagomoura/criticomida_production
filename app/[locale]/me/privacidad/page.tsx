import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PrivacyClient from './PrivacyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacy' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="cc-container py-8">
      <PrivacyClient />
    </main>
  );
}
