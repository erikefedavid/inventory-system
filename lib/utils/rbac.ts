import type { UserRole } from '@/lib/models/User';

const ROLE_RANK: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  clerk: 1,
};

export function hasMinimumRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export function requireRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

export const ROLES = {
  adminOnly: ['admin'] as UserRole[],
  adminManager: ['admin', 'manager'] as UserRole[],
  all: ['admin', 'manager', 'clerk'] as UserRole[],
  clerkPlus: ['admin', 'manager', 'clerk'] as UserRole[],
};
