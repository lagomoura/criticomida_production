import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Palato',
    short_name: 'Palato',
    description: 'Reseñá platos puntuales, no restaurantes enteros.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F1E8',
    theme_color: '#C96A4B',
    lang: 'es',
    icons: [
      { src: '/icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
