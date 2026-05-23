import dbConnect from '@/lib/db/mongoose';
import { listTransactions } from '@/lib/services/transaction.service';
import { apiSuccess } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const url = new URL(request.url);
  const transactions = await listTransactions({
    businessId: check.auth.businessId,
    productId: url.searchParams.get('productId') ?? undefined,
    type: url.searchParams.get('type') ?? undefined,
    limit: parseInt(url.searchParams.get('limit') || '50', 10),
  });
  return apiSuccess(transactions);
}
