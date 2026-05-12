import { NextResponse } from 'next/server';

// Auth middleware disabled — Clerk keys not yet configured.
// Replace this with clerkMiddleware() once NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// and CLERK_SECRET_KEY are added to Vercel environment variables.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
