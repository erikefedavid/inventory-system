import dbConnect from '@/lib/db/mongoose';
import {
  getProduct,
  updateProduct,
  archiveProduct,
} from '@/lib/services/product.service';
import { UpdateProductSchema } from '@/lib/validations/product.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';
import { StockTransaction } from '@/lib/models/StockTransaction';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const { id } = await params;
  try {
    const product = await getProduct(id, check.auth.businessId);
    const transactions = await StockTransaction.find({
      product: id,
      businessId: check.auth.businessId,
    })
      .sort({ createdAt: -1 })
      .limit(50);
    return apiSuccess({ product, transactions });
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
  const parsed = UpdateProductSchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400, parsed.error.format());
  try {
    const product = await updateProduct(
      id,
      parsed.data,
      check.auth.businessId,
      check.auth.userId
    );
    return apiSuccess(product);
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
    const product = await archiveProduct(id, check.auth.businessId, check.auth.userId);
    return apiSuccess(product);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Archive failed', 400);
  }
}
