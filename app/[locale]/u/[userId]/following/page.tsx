import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FollowListClient from '@/app/components/social/FollowListClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.following' });
  return { title: t('title') };
}

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function FollowingPage({ params }: Props) {
  const { userId } = await params;
  return (
    <main id="main-content">
      <FollowListClient userId={userId} mode="following" />
    </main>
  );
}
