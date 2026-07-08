import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// list of protected routes
const protectedRoutes = createRouteMatcher(['/users-form']);

// middleware to protect protected routes with Clerk authentication
export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) await auth.protect();
});

export function proxy(request: NextRequest) {
  // return NextResponse.redirect(new URL('/about', request.url));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
