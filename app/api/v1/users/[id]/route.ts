import { z } from 'zod';
import dbConnect from '@/lib/db/mongoose';
import { updateUser, deactivateUser } from '@/lib/services/user.service';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';

const updateSchema = z.object({
  role: z.enum(['admin', 'manager', 'clerk']).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ['admin']);
  if ('response' in check) return check.response;
  await dbConnect();
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400);
  try {
    const user = await updateUser(id, parsed.data, check.auth.businessId, check.auth.userId);
    return apiSuccess(user);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Update failed', 400);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ['admin']);
  if ('response' in check) return check.response;
  await dbConnect();
  const { id } = await params;
  try {
    const user = await deactivateUser(id, check.auth.businessId, check.auth.userId);
    return apiSuccess(user);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Deactivate failed', 400);
  }
}
