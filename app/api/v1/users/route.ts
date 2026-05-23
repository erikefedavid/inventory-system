import { z } from 'zod';
import dbConnect from '@/lib/db/mongoose';
import { listUsers, createStaffUser } from '@/lib/services/user.service';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'clerk']),
});

export async function GET(request: Request) {
  const check = requireApiAuth(request, ['admin']);
  if ('response' in check) return check.response;
  await dbConnect();
  const users = await listUsers(check.auth.businessId);
  return apiSuccess(users);
}

export async function POST(request: Request) {
  const check = requireApiAuth(request, ['admin']);
  if ('response' in check) return check.response;
  await dbConnect();
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400, parsed.error.format());
  const admin = await import('@/lib/models/User').then((m) => m.User.findById(check.auth.userId));
  if (!admin) return apiError('Admin not found', 404);
  try {
    const user = await createStaffUser({
      ...parsed.data,
      businessId: check.auth.businessId,
      businessName: admin.businessName,
      adminId: check.auth.userId,
    });
    return apiSuccess(user, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to create user', 400);
  }
}
