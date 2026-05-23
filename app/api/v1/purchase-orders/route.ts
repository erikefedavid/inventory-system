import dbConnect from '@/lib/db/mongoose';
import { listPurchaseOrders, createPurchaseOrder } from '@/lib/services/purchaseOrder.service';
import { CreatePurchaseOrderSchema } from '@/lib/validations/purchaseOrder.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();

  const url = new URL(request.url);
  const supplierId = url.searchParams.get('supplierId') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;

  const pos = await listPurchaseOrders({
    businessId: check.auth.businessId,
    supplierId,
    status,
  });

  return apiSuccess(pos);
}

export async function POST(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = CreatePurchaseOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid input', 400, parsed.error.format());
    }

    const po = await createPurchaseOrder({
      ...parsed.data,
      businessId: check.auth.businessId,
      createdBy: check.auth.userId,
    });

    return apiSuccess(po, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to create purchase order', 400);
  }
}
