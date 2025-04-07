import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
// const AUTH_ROUTES = ['/dashboard', '/profile', '/settings'];
const AUTH_ROUTES: string[] = [];

// Routes that don't require authentication
// const PUBLIC_ROUTES = ['/login', '/register'];
const PUBLIC_ROUTES: string[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, etc.
  if (pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get the authentication token from the cookies
  // Note: In this simplified example, we're using a cookie.
  // In a production app, use secure HttpOnly cookies and proper JWTs
  const authToken = request.cookies.get('auth_token')?.value;

  // Check if the user is authenticated and trying to access an auth-required route
  if (!authToken && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL('/login', request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if authenticated user is trying to access login page
  if (authToken && PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // Redirect authenticated users to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};