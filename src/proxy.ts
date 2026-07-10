import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Route matchers — each one defines a set of paths a rule applies to.
const protectedRoutes = createRouteMatcher(['/users-form']);
const legacyRoutes = createRouteMatcher(['/old-page']);
const apiRoutes = createRouteMatcher(['/api/private(.*)']);
const sentryTestEdge = createRouteMatcher(['/sentry-test/edge']);

// The default export is the proxy handler — Next.js runs this on every
// matching request BEFORE the request reaches the server. The function
// name doesn't matter; only `export default` is what Next.js looks for.
export default clerkMiddleware(async (auth, req) => {
  // Rule 1 — redirect legacy paths
  if (legacyRoutes(req)) {
    return NextResponse.redirect(new URL('/about', req.url));
  }

  // Rule 2 — require authentication for protected routes
  if (protectedRoutes(req)) {
    await auth.protect();
  }

  // Rule 3: require API key for private API
  if (apiRoutes(req)) {
    await auth.protect();
  }

  // Rule 4 — Sentry edge test (throws to verify edge error tracking)
  if (sentryTestEdge(req)) {
    throw new Error('[Sentry Test] Edge error from proxy.ts');
  }

  // No rule matched — request passes through to the app normally.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
