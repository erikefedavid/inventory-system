import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/utils/authCookie';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', { ...authCookieOptions(), maxAge: 0 });
  return response;
}
