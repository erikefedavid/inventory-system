import dbConnect from '@/lib/db/mongoose';
import { getPurchaseOrder, updatePurchaseOrder } from '@/lib/services/purchaseOrder.service';
import { UpdatePurchaseOrderSchema } from '@/lib/validations/purchaseOrder.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();

  try {
    const { id } = await params;
    const po = await getPurchaseOrder(id, check.auth.businessId);
    return apiSuccess(po);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Purchase order not found', 404);
  }
}

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
    const parsed = UpdatePurchaseOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid input', 400, parsed.error.format());
    }

    const po = await updatePurchaseOrder(
      id,
      parsed.data,
      check.auth.businessId,
      check.auth.userId
    );
    return apiSuccess(po);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to update purchase order', 400);
  }
}
