// apps/web/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // For now, let's skip token check and just return next
  // We'll handle auth in the client side with AuthGuard
  return NextResponse.next();

  // TODO: Implement cookie-based auth check later
  /*
  const token = request.cookies.get('accessToken');
  
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)',
  ],
};