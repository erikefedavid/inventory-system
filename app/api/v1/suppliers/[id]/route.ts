import dbConnect from '@/lib/db/mongoose';
import { getSupplier, updateSupplier, archiveSupplier } from '@/lib/services/supplier.service';
import { UpdateSupplierSchema } from '@/lib/validations/supplier.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';
import { PurchaseOrder } from '@/lib/models/PurchaseOrder';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const { id } = await params;
  try {
    const supplier = await getSupplier(id, check.auth.businessId);
    const purchaseOrders = await PurchaseOrder.find({
      supplier: id,
      businessId: check.auth.businessId,
    }).sort({ createdAt: -1 });
    return apiSuccess({ supplier, purchaseOrders });
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Not found', 404);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const { id } = await params;
  const parsed = UpdateSupplierSchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400);
  try {
    const supplier = await updateSupplier(id, parsed.data, check.auth.businessId, check.auth.userId);
    return apiSuccess(supplier);
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
    const supplier = await archiveSupplier(id, check.auth.businessId, check.auth.userId);
    return apiSuccess(supplier);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Archive failed', 400);
  }
}
