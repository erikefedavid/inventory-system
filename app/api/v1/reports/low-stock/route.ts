import dbConnect from '@/lib/db/mongoose';
import { getLowStockProducts } from '@/lib/services/product.service';
import { apiSuccess } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const products = await getLowStockProducts(check.auth.businessId);
  return apiSuccess(products);
}
