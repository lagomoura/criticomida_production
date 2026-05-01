import type { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Nueva contraseña | CritiComida',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;
  return (
    <main id="main-content">
      <ResetPasswordClient token={token} />
    </main>
  );
}
