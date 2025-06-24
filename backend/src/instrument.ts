import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import 'dotenv/config'; // so that .env can be used in here. because we used configModule

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0, // Capture 100% of transactions
    // Set sampling rate for profiling - this is evaluated only once per SDK.init call
    profilesSampleRate: 1.0, // Capture 100% of profiles
    // Trace lifecycle automatically enables profiling during active traces
    profileLifecycle: 'trace',

    sendDefaultPii: true, // Send user PII E.g email, username, IP address
});

// Profiling happens automatically after setting it up with `Sentry.init()`.
// All spans (unless those discarded by sampling) will have profiling data attached to them.
// Sentry.startSpan({
//   name: "My Span",
// }, () => {
//   // The code executed here will be profiled
// });