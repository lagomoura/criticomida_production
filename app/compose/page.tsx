import type { Metadata } from 'next';
import { Suspense } from 'react';
import ComposeClient from './ComposeClient';

export const metadata: Metadata = {
  title: 'Nueva reseña | CritiComida',
};

export default function ComposePage() {
  return (
    <main id="main-content">
      <Suspense fallback={null}>
        <ComposeClient />
      </Suspense>
    </main>
  );
}
