import dbConnect from '@/lib/db/mongoose';
import { User } from '@/lib/models/User';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';

export async function GET(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const user = await User.findById(check.auth.userId).select(
    '-password -resetToken -resetTokenExpiry'
  );
  if (!user) return apiError('User not found', 404);
  return apiSuccess(user);
}

export async function PUT(request: Request) {
  const check = requireApiAuth(request, ROLES.all);
  if ('response' in check) return check.response;
  await dbConnect();
  const body = await request.json();
  const allowed = ['name', 'phone', 'avatar'];
  const update: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  const user = await User.findByIdAndUpdate(check.auth.userId, update, { new: true }).select(
    '-password -resetToken -resetTokenExpiry'
  );
  if (!user) return apiError('User not found', 404);
  return apiSuccess(user);
}
