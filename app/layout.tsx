import './fontawesome';
import type { Metadata } from "next";
import { Dosis, Kaushan_Script } from 'next/font/google';
import "./globals.css";
import Navbar from './components/Navbar';

const dosis = Dosis({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-dosis' });
const kaushan = Kaushan_Script({ subsets: ['latin'], weight: '400', variable: '--font-kaushan' });

export const metadata: Metadata = {
  title: "Criticomida",
  description: "Food review site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${dosis.variable} ${kaushan.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
