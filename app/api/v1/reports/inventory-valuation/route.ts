import dbConnect from '@/lib/db/mongoose';
import { getInventoryValuation } from '@/lib/services/report.service';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();

  try {
    const report = await getInventoryValuation(check.auth.businessId);
    return apiSuccess(report);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to fetch inventory valuation report', 400);
  }
}
