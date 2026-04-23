import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/free-brands-svg-icons',
    '@fortawesome/react-fontawesome',
  ],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    // Legacy editorial category URLs → new social path. Only the known slugs
    // redirect; anything else under /reviews/* resolves to the social detail
    // route (/reviews/[id]).
    const legacySlugs = [
      'dulces',
      'brunchs',
      'desayunos',
      'mexico-food',
      'japan-food',
      'arabic-food',
      'israelfood',
      'thaifood',
      'koreanfood',
      'chinafood',
      'parrillas',
      'brazilfood',
      'burguers',
      'helados',
      'peru-food',
    ];
    return [
      {
        source: `/reviews/:slug(${legacySlugs.join('|')})`,
        destination: '/categorias/:slug',
        // 307 en lugar de 308: los browsers cachean 308 de forma agresiva y
        // cambios posteriores al pattern dejan a los usuarios atrapados en
        // redirects viejos. Para slugs editoriales legacy alcanza con 307.
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staticmap.openstreetmap.de',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
