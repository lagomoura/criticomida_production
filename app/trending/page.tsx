import type { Metadata } from 'next';
import TrendingClient from './TrendingClient';

export const metadata: Metadata = {
  title: 'Trending | CritiComida',
  description: 'Los platos más buscados por los críticos en tu ciudad.',
};

export default function TrendingPage() {
  return (
    <main id="main-content">
      <TrendingClient />
    </main>
  );
}
