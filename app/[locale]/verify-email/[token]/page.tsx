import type { Metadata } from 'next';
import VerifyEmailClient from './VerifyEmailClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Confirmar email | CritiComida',
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({ params }: PageProps) {
  const { token } = await params;
  return (
    <main id="main-content">
      <VerifyEmailClient token={token} />
    </main>
  );
}
