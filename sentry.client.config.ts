// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever the browser loads your app.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (!dsn) {
  console.warn('[Sentry] DSN not set — errors will not be reported. Add NEXT_PUBLIC_SENTRY_DSN to .env.local');
}

Sentry.init({
  dsn,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // Session replays — sample at 10% of sessions, always record when an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  // Disable Sentry entirely when no DSN is set (avoids silent failures)
  enabled: !!dsn,
});
