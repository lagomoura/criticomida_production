import type { Metadata } from 'next';
import ReviewDetailClient from './ReviewDetailClient';

export const metadata: Metadata = {
  title: 'Reseña | CritiComida',
};

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
