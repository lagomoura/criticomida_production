import type { Metadata } from 'next';
import WantToTryClient from './WantToTryClient';

export const metadata: Metadata = {
  title: 'Quiero probar | CritiComida',
  description: 'Tu lista de platos pendientes para el próximo viernes.',
};

export default function WantToTryPage() {
  return (
    <main id="main-content">
      <WantToTryClient />
    </main>
  );
}
