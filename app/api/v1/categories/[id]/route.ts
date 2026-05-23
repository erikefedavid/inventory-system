import dbConnect from '@/lib/db/mongoose';
import { updateCategory, archiveCategory } from '@/lib/services/category.service';
import { CreateCategorySchema } from '@/lib/validations/product.schema';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const { id } = await params;
  const parsed = CreateCategorySchema.partial().safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400);
  try {
    const category = await updateCategory(id, parsed.data, check.auth.businessId, check.auth.userId);
    return apiSuccess(category);
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
    await archiveCategory(id, check.auth.businessId, check.auth.userId);
    return apiSuccess({ deleted: true });
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Delete failed', 400);
  }
}
