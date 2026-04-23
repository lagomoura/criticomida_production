import type { Metadata } from 'next';
import PublicProfileClient from './PublicProfileClient';

export const metadata: Metadata = {
  title: 'Perfil | CritiComida',
};

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;
  return (
    <main id="main-content">
      <PublicProfileClient userId={userId} />
    </main>
  );
}
