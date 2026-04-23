import type { Metadata } from 'next';
import EditorialLanding from '../components/EditorialLanding';

export const metadata: Metadata = {
  title: 'Sobre CritiComida',
  description: 'Qué es CritiComida: reseñas de platos, no de restaurantes.',
};

export default function AboutPage() {
  return <EditorialLanding />;
}
