import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AdminUncategorizedClient from './AdminUncategorizedClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.adminUncategorized' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function AdminUncategorizedPage() {
  return (
    <main id="main-content">
      <AdminUncategorizedClient />
    </main>
  );
}
