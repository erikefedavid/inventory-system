import dbConnect from '@/lib/db/mongoose';
import { recordAdjustment } from '@/lib/services/transaction.service';
import { AdjustmentSchema } from '@/lib/validations/transaction.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function POST(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const parsed = AdjustmentSchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400, parsed.error.format());
  try {
    const tx = await recordAdjustment({
      userId: check.auth.userId,
      businessId: check.auth.businessId,
      ...parsed.data,
    });
    return apiSuccess(tx, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to record adjustment', 500);
  }
}
