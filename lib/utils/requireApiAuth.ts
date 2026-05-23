import { getAuthContextFromRequest, type AuthContext } from './apiAuth';
import { apiError } from './apiResponse';
import { requireRole } from './rbac';
import type { UserRole } from '@/lib/models/User';

export function requireApiAuth(
  request: Request,
  allowedRoles?: UserRole[]
): { auth: AuthContext } | { response: ReturnType<typeof apiError> } {
  const auth = getAuthContextFromRequest(request);
  if (!auth) return { response: apiError('Unauthorized', 401) };
  if (allowedRoles && !requireRole(auth.role, allowedRoles)) {
    return { response: apiError('Forbidden', 403) };
  }
  return { auth };
}
