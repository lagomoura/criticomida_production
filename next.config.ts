import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
  async headers() {
    // Hardening baseline. We deliberately omit a strict CSP for now —
    // several legit components still ship `dangerouslySetInnerHTML`
    // (theme bootstrap inline script, OG route) and a strict CSP would
    // blackhole them. Roll out CSP in Report-Only mode first, audit
    // reports, then promote to enforced.
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        // interest-cohort (FLoC) quedó deprecated y Chromium ya no lo
        // reconoce; dejarlo dispara un warning ruidoso en consola sin
        // aportar opt-out alguno.
        value: 'camera=(), microphone=(), geolocation=(self)',
      },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    // El backend devuelve URLs relativas (/uploads/abc.webp) y los archivos
    // los sirve FastAPI en NEXT_PUBLIC_API_URL/uploads/*. En dev apunta a
    // localhost:8002, en prod a Railway. Mantener la URL relativa en la DB
    // hace que las fotos sean portables si cambia el dominio del backend.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
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

    // Slug renames de la migración 047. Convención limpia (chinafood→china,
    // mexico-food→mexicana, etc.). 307 también para no atrapar al browser
    // si más adelante cambian los slugs nuevos.
    const renamedSlugs: Array<[string, string]> = [
      ['brazilfood', 'brasilena'],
      ['peru-food', 'peruana'],
      ['mexico-food', 'mexicana'],
      ['arabic-food', 'arabe'],
      ['israelfood', 'israeli'],
      ['japan-food', 'japonesa'],
      ['chinafood', 'china'],
      ['koreanfood', 'coreana'],
      ['thaifood', 'thai'],
      ['parrillas', 'parrilla'],
      ['burguers', 'burgers'],
    ];

    const renameRedirects = renamedSlugs.flatMap(([from, to]) => [
      {
        source: `/categorias/${from}`,
        destination: `/categorias/${to}`,
        permanent: false,
      },
      {
        source: `/:locale(es|en|pt)/categorias/${from}`,
        destination: `/:locale/categorias/${to}`,
        permanent: false,
      },
    ]);

    return [
      {
        source: `/reviews/:slug(${legacySlugs.join('|')})`,
        destination: '/categorias/:slug',
        // 307 en lugar de 308: los browsers cachean 308 de forma agresiva y
        // cambios posteriores al pattern dejan a los usuarios atrapados en
        // redirects viejos. Para slugs editoriales legacy alcanza con 307.
        permanent: false,
      },
      ...renameRedirects,
    ];
  },
  images: {
    // 75 = default de next/image (resto de la app). 82 = fotos de comida en
    // el feed/detalle: el plato es el héroe, vale el peso extra para que se
    // vea nítido en desktop/retina.
    qualities: [75, 82],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staticmap.openstreetmap.de',
        pathname: '/**',
      },
      // Backend de FastAPI en dev: docker compose mapea host :8002 → contenedor :8000
      // y el rewrite de /uploads/:path* apunta ahí. next/image necesita el host
      // exacto para optimizar las imágenes que vienen del backend.
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8002',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8002',
        pathname: '/**',
      },
      // Backend en prod: el hostname se resuelve desde NEXT_PUBLIC_API_URL al
      // build de Vercel. Si la env var no está seteada, no agregamos pattern
      // (las imágenes seguirán sirviéndose vía el rewrite, que sí funciona,
      // pero next/image las dejará pasar sin optimizar).
      ...(process.env.NEXT_PUBLIC_API_URL
        ? (() => {
            try {
              const u = new URL(process.env.NEXT_PUBLIC_API_URL!);
              return [
                {
                  protocol: u.protocol.replace(':', '') as 'http' | 'https',
                  hostname: u.hostname,
                  pathname: '/**',
                },
              ];
            } catch {
              return [];
            }
          })()
        : []),
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
      {
        protocol: 'https',
        hostname: '**.fal.media',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fal.media',
        pathname: '/**',
      },
    ],
  },
};

// next-intl debe correr primero (lee i18n/request.ts), después Sentry envuelve
// todo para inyectar el build-time plugin de source maps + tree-shaking.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Hace que el upload tome también los chunks compartidos del cliente.
  widenClientFileUpload: true,
  // Bypass de ad-blockers: el SDK manda eventos vía /monitoring (mismo
  // origen) en lugar del endpoint de Sentry directo. El middleware.ts
  // matcher excluye esta ruta para que next-intl no la intercepte.
  tunnelRoute: '/monitoring',
  // Logging del plugin: silencioso fuera de CI.
  silent: !process.env.CI,
  // Reemplaza al deprecated `disableLogger`. Es webpack-only — si en el
  // futuro migramos a Turbopack, este bloque hay que removerlo.
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
