import type { Metadata } from 'next';
import AdminClaimsClient from './AdminClaimsClient';

export const metadata: Metadata = {
  title: 'Reclamos de restaurantes | CritiComida',
  robots: { index: false, follow: false },
};

export default function AdminClaimsPage() {
  return (
    <main id="main-content">
      <AdminClaimsClient />
    </main>
  );
}
