import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Iniciar sesión · CritiComida',
  description: 'Accedé a tu cuenta para reseñar platos y seguir críticos.',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <LoginClient searchParamsPromise={searchParams} />;
}
