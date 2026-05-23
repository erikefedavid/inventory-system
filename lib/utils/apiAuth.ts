import { headers } from 'next/headers';
import type { UserRole } from '@/lib/models/User';

export interface AuthContext {
  userId: string;
  role: UserRole;
  businessId: string;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const h = await headers();
  const userId = h.get('x-user-id');
  const role = h.get('x-user-role') as UserRole | null;
  const businessId = h.get('x-business-id');
  if (!userId || !role || !businessId) return null;
  return { userId, role, businessId };
}

export function getAuthContextFromRequest(request: Request): AuthContext | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role') as UserRole | null;
  const businessId = request.headers.get('x-business-id');
  if (!userId || !role || !businessId) return null;
  return { userId, role, businessId };
}
