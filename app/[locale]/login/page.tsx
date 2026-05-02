import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginClient from './LoginClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.login' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <LoginClient searchParamsPromise={searchParams} />;
}
