import dbConnect from '@/lib/db/mongoose';
import { createProduct, listProducts } from '@/lib/services/product.service';
import { CreateProductSchema } from '@/lib/validations/product.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const url = new URL(request.url);
  const products = await listProducts({
    businessId: check.auth.businessId,
    search: url.searchParams.get('search') ?? undefined,
    categoryId: url.searchParams.get('categoryId') ?? undefined,
  });
  return apiSuccess(products);
}

export async function POST(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const body = await request.json();
  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Invalid input', 400, parsed.error.format());
  }
  try {
    const product = await createProduct({
      ...parsed.data,
      businessId: check.auth.businessId,
      createdBy: check.auth.userId,
    });
    return apiSuccess(product, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to create product', 400);
  }
}
