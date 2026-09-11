// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
Sentry.init({
  // Use server-side DSN or fall back to the public client DSN if not provided
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Use a numeric env var for control.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Off deliberately. With this on, Sentry attaches the requesting IP address,
  // request headers and cookies to every event and stores them in the US. That
  // is personal data of Rwandan and Liberian users leaving the country for a
  // purpose (crash triage) that does not need it. Stack traces and request
  // paths are enough to debug with.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,

  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
});
