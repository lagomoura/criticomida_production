import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AdminClaimsClient from './AdminClaimsClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.adminClaims' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function AdminClaimsPage() {
  return (
    <main id="main-content">
      <AdminClaimsClient />
    </main>
  );
}
