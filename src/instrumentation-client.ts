// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://2e3e4b134d30468303131ad7e75c515b@o4510249917808640.ingest.us.sentry.io/4510249918857216",

  /*
    Replay is deliberately NOT listed here. Including it pulls the Session
    Replay recorder into the shared chunk that loads on every page — Sentry was
    47% of that bundle, and Replay is the bulk of it. It is attached below,
    lazily, so the 90% of sessions that are never sampled don't download it.
  */
  integrations: [],

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

/*
  Attach Session Replay after the page is idle, fetched on demand rather than
  bundled. Behaviour is unchanged (same sample rates); it simply stops competing
  with first paint for bandwidth and main-thread time.
*/
if (typeof window !== "undefined") {
  const attachReplay = () => {
    Sentry.lazyLoadIntegration("replayIntegration")
      .then((replayIntegration) => {
        Sentry.addIntegration(replayIntegration());
      })
      // Never let telemetry break the page: if the CDN is blocked or offline,
      // error reporting still works, just without replays.
      .catch(() => {});
  };

  // Read it off first rather than using `in`, which narrows window to never
  // in the else branch when requestIdleCallback isn't in the DOM lib types.
  const idle = (
    window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }
  ).requestIdleCallback;

  if (typeof idle === "function") {
    idle(attachReplay, { timeout: 5000 });
  } else {
    window.setTimeout(attachReplay, 3000);
  }
}
