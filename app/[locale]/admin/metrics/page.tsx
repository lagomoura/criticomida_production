import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AdminMetricsClient from './AdminMetricsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.adminMetrics' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function AdminMetricsPage() {
  return (
    <main id="main-content">
      <AdminMetricsClient />
    </main>
  );
}
