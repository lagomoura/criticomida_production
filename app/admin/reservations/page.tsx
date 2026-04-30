import type { Metadata } from 'next';
import AdminReservationsClient from './AdminReservationsClient';

export const metadata: Metadata = {
  title: 'Reservas afiliadas | CritiComida',
  robots: { index: false, follow: false },
};

export default function AdminReservationsPage() {
  return (
    <main id="main-content">
      <AdminReservationsClient />
    </main>
  );
}
