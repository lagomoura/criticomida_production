import './fontawesome';
import type { Metadata, Viewport } from 'next';
import { Dosis, Kaushan_Script } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';

const dosis = Dosis({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-dosis',
});
const kaushan = Kaushan_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-kaushan',
});

export const metadata: Metadata = {
  title: 'Criticomida',
  description: 'Food review site',
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
    <html lang="en">
      <body className={`${dosis.variable} ${kaushan.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
