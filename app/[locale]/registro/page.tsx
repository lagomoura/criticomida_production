import type { Metadata } from 'next';
import RegistroClient from './RegistroClient';

export const metadata: Metadata = {
  title: 'Crear cuenta · CritiComida',
  description: 'Sumate a CritiComida para reseñar platos y compartir lo que probás.',
};

export default function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <RegistroClient searchParamsPromise={searchParams} />;
}
