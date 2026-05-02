import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ReviewDetailClient from './ReviewDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.review' });
  return { title: t('title') };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main id="main-content">
      <ReviewDetailClient postId={id} />
    </main>
  );
}
