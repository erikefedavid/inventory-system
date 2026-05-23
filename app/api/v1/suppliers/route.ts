import dbConnect from '@/lib/db/mongoose';
import { listSuppliers, createSupplier } from '@/lib/services/supplier.service';
import { CreateSupplierSchema } from '@/lib/validations/supplier.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const url = new URL(request.url);
  const suppliers = await listSuppliers(
    check.auth.businessId,
    url.searchParams.get('search') ?? undefined
  );
  return apiSuccess(suppliers);
}

export async function POST(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const parsed = CreateSupplierSchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400, parsed.error.format());
  try {
    const supplier = await createSupplier({
      ...parsed.data,
      businessId: check.auth.businessId,
      userId: check.auth.userId,
    });
    return apiSuccess(supplier, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to create supplier', 400);
  }
}
