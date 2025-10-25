// This file configures Sentry in the browser (client-side).
// Import this file from a top-level client component so it runs once.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
  // Reduce noise by disabling in development unless explicitly enabled
  debug: process.env.NODE_ENV !== 'production' && process.env.SENTRY_DEBUG === 'true',
});
