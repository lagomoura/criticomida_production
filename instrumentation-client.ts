// Sentry client init — canonical file en @sentry/nextjs v8+ (estamos en v10).
// Esta es la inicialización del SDK en el browser; el server/edge inician
// desde instrumentation.ts → sentry.{server,edge}.config.ts.
// `sentry.client.config.ts` era el patrón legacy de v7 y está deliberadamente
// ausente: la SDK actual auto-detecta este archivo por nombre vía el hook
// de instrumentación de Next.js 15. No agregar el legacy o se duplica el init.
import * as Sentry from '@sentry/nextjs';

// Vercel inyecta NEXT_PUBLIC_VERCEL_ENV (production | preview | development)
// en build. NODE_ENV es fallback para dev local fuera de Vercel.
const environment =
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  // Postura conservadora: sin IP del usuario ni cookies en eventos.
  // El user context se setea manualmente en AuthContext (id + handle).
  sendDefaultPii: false,
  tracesSampleRate: environment === 'development' ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      // Texto enmascarado e inputs bloqueados para no filtrar lo que el
      // usuario escribe (passwords, drafts de reviews, mensajes al chatbot).
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
