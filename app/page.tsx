import type { Metadata } from 'next';
import FeedClient from './components/feed/FeedClient';

export const metadata: Metadata = {
  title: 'CritiComida',
  description: 'Reseñas de platos. El feed con lo que vale la pena pedir.',
};

export default function Home() {
  return (
    <main id="main-content">
      <FeedClient />
    </main>
  );
}
