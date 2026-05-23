import dbConnect from '@/lib/db/mongoose';
import { updatePurchaseOrderStatus } from '@/lib/services/purchaseOrder.service';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';
import { z } from 'zod';

const StatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'received', 'cancelled']),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid status', 400, parsed.error.format());
    }

    const po = await updatePurchaseOrderStatus(
      id,
      parsed.data.status,
      check.auth.businessId,
      check.auth.userId
    );
    return apiSuccess(po);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to update purchase order status', 400);
  }
}
