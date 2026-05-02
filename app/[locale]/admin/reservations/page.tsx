import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AdminReservationsClient from './AdminReservationsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.adminReservations' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function AdminReservationsPage() {
  return (
    <main id="main-content">
      <AdminReservationsClient />
    </main>
  );
}
