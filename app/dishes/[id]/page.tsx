import type { Metadata } from 'next';
import DishDetailClient from './DishDetailClient';

export const metadata: Metadata = {
  title: 'Plato | CritiComida',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DishDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main id="main-content">
      <DishDetailClient dishId={id} />
    </main>
  );
}
