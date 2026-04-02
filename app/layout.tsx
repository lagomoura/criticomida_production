import type { Metadata, Viewport } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import './fontawesome';
import './globals.css';
import Providers from './components/Providers';

/** Legible sans for UI + reading (Krug: scanability, zero guesswork). */
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-source-sans-3',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CritiComida',
  description: 'Reseñas honestas de restaurantes, bares y cafés.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${sourceSans3.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
