// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://2e3e4b134d30468303131ad7e75c515b@o4510249917808640.ingest.us.sentry.io/4510249918857216",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,

  // Reduce noise by disabling debug in production
  debug: process.env.NODE_ENV !== 'production' && process.env.SENTRY_DEBUG === 'true',
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
