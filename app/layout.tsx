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
    <html lang="es" suppressHydrationWarning>
      <body className={`${sourceSans3.variable} antialiased`}>
        {/* Inline script runs before hydration to avoid flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
