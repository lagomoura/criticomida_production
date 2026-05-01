import type { Metadata } from 'next';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notificaciones | CritiComida',
};

export default function NotificationsPage() {
  return (
    <main id="main-content">
      <NotificationsClient />
    </main>
  );
}
