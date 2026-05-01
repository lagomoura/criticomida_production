import type { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: 'Olvidé mi contraseña | CritiComida',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main id="main-content">
      <ForgotPasswordClient />
    </main>
  );
}
