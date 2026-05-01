import type { Metadata } from 'next';
import AdminMetricsClient from './AdminMetricsClient';

export const metadata: Metadata = {
  title: 'Métricas B2B | CritiComida',
  robots: { index: false, follow: false },
};

export default function AdminMetricsPage() {
  return (
    <main id="main-content">
      <AdminMetricsClient />
    </main>
  );
}
