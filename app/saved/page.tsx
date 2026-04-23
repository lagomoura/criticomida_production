import type { Metadata } from 'next';
import SavedClient from './SavedClient';

export const metadata: Metadata = {
  title: 'Guardados | CritiComida',
};

export default function SavedPage() {
  return (
    <main id="main-content">
      <SavedClient />
    </main>
  );
}
