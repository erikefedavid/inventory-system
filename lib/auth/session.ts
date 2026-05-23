import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/utils/jwt';
import type { UserRole } from '@/lib/models/User';

export interface Session {
  userId: string;
  role: UserRole;
  businessId: string;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  if (!payload?.sub || !payload.role || !payload.businessId) return null;
  return {
    userId: payload.sub as string,
    role: payload.role as UserRole,
    businessId: payload.businessId as string,
  };
}
