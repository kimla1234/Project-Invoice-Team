import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('final-refresh-token')?.value;
  const { pathname } = request.nextUrl;

  // Token (Public Routes)
  const publicRoutes = [
    '/login',
    '/register',
    '/api/refresh',
    '/_next',
    '/auth/google/callback', 
    '/oauth2/callback' ,       
    '/invoice-view',
    '/quotation-view'
  ];


  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }


  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {

  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};