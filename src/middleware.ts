// define code that will run before every routes
// before you hit endpoint, code in this middleware will run first

import { authMiddleware } from "@clerk/nextjs/server";

// this code will run necessary stuff to protect our routes
// need to make /api/webhook public since stripe is the one hitting it
export default authMiddleware({
    publicRoutes: ["/", '/api/webhook']
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};