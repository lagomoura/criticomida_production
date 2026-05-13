import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AdminCategoriasPendientesClient from './AdminCategoriasPendientesClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'metadata.adminCategoriasPendientes',
  });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function AdminCategoriasPendientesPage() {
  return (
    <main id="main-content">
      <AdminCategoriasPendientesClient />
    </main>
  );
}
