import * as Sentry from '@sentry/nextjs';

const environment =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV;

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  sendDefaultPii: false,
  tracesSampleRate: environment === 'development' ? 1.0 : 0.1,
});
