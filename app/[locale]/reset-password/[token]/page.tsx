import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ResetPasswordClient from './ResetPasswordClient';

interface PageProps {
  params: Promise<{ token: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.resetPassword' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;
  return (
    <main id="main-content">
      <ResetPasswordClient token={token} />
    </main>
  );
}
