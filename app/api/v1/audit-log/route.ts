import dbConnect from '@/lib/db/mongoose';
import { AuditLog } from '@/lib/models/AuditLog';
import { User } from '@/lib/models/User';
import { apiSuccess } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ['admin']);
  if ('response' in check) return check.response;
  await dbConnect();
  const url = new URL(request.url);
  const query: Record<string, unknown> = {};
  const userIds = await User.find({ businessId: check.auth.businessId }).distinct('_id');
  query.user = { $in: userIds };
  if (url.searchParams.get('action')) query.action = url.searchParams.get('action');
  const logs = await AuditLog.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  return apiSuccess(logs);
}
