import type { Metadata } from 'next';
import AdminReportsClient from './AdminReportsClient';

export const metadata: Metadata = {
  title: 'Moderación | CritiComida',
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return (
    <main id="main-content">
      <AdminReportsClient />
    </main>
  );
}
