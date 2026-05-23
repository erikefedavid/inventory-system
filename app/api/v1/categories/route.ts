import dbConnect from '@/lib/db/mongoose';
import { listCategories, createCategory } from '@/lib/services/category.service';
import { CreateCategorySchema } from '@/lib/validations/product.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const categories = await listCategories(check.auth.businessId);
  return apiSuccess(categories);
}

export async function POST(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const parsed = CreateCategorySchema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400, parsed.error.format());
  try {
    const category = await createCategory({
      ...parsed.data,
      businessId: check.auth.businessId,
      createdBy: check.auth.userId,
    });
    return apiSuccess(category, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to create category', 400);
  }
}
