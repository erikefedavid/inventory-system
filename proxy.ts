// proxy.ts - Next.js Edge Proxy for authentication and RBAC
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/utils/jwt';

// Public routes that do not require authentication
const PUBLIC_ROUTES = new Set([
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Skip for public routes and static assets
  if (
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth')?.value;
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    if (!payload) {
      // Invalid token payload
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Forward user info via headers for downstream API handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-role', payload.role as string);
    if (payload.businessId) {
      requestHeaders.set('x-business-id', payload.businessId as string);
    }
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return response;
  } catch (err) {
    console.error('JWT verification error:', err);
    return new NextResponse('Unauthorized', { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
