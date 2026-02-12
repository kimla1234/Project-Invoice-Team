import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define routes that NEVER need a redirect
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isApiRoute = pathname.startsWith('/api');
  const isPublicAsset = pathname.startsWith('/_next') || pathname.includes('favicon.ico');

  // 2. If it's an API route or a public asset, let it pass through immediately
  if (isApiRoute || isAuthRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // 3. For protected PAGES (UI), check the token
  const token = request.cookies.get('final-refresh-token')?.value;

  if (!token) {
    // Only redirect to login if the user is trying to access a UI page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 4. Match EVERYTHING except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};