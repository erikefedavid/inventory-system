import { z } from 'zod';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/utils/auth';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  await dbConnect();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid input', 400);

  const user = await User.findOne({ email: parsed.data.email }).select('+resetToken +resetTokenExpiry');
  if (!user || !user.resetToken || user.resetToken !== parsed.data.otp) {
    return apiError('Invalid or expired reset code', 400);
  }
  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return apiError('Invalid or expired reset code', 400);
  }

  user.password = await hashPassword(parsed.data.password);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  return apiSuccess({ message: 'Password updated successfully' });
}
