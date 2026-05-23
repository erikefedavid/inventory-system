import dbConnect from '@/lib/db/mongoose';
import { getStockMovementReport } from '@/lib/services/report.service';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();

  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? undefined;
    const to = url.searchParams.get('to') ?? undefined;
    const productId = url.searchParams.get('productId') ?? undefined;
    const type = url.searchParams.get('type') ?? undefined;

    const report = await getStockMovementReport(check.auth.businessId, {
      from,
      to,
      productId,
      type,
    });
    return apiSuccess(report);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to fetch stock movement report', 400);
  }
}
