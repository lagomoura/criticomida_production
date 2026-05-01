import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Buscar | CritiComida',
};

export default function SearchPage() {
  return (
    <main id="main-content">
      <SearchClient />
    </main>
  );
}
