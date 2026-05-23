import dbConnect from '@/lib/db/mongoose';
import { getCategoryValueData } from '@/lib/services/dashboard.service';
import { apiSuccess } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.adminManager);
  if ('response' in check) return check.response;
  await dbConnect();
  const data = await getCategoryValueData(check.auth.businessId);
  return apiSuccess(data);
}
