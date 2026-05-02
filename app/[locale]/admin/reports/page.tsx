import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AdminReportsClient from './AdminReportsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.adminReports' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function AdminReportsPage() {
  return (
    <main id="main-content">
      <AdminReportsClient />
    </main>
  );
}
