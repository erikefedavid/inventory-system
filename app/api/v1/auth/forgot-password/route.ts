import { z } from 'zod';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/lib/models/User';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  await dbConnect();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiError('Invalid email', 400);

  const user = await User.findOne({ email: parsed.data.email });
  if (user) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetToken = otp;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    // Email via Resend can be wired in Sprint 3; OTP logged in dev only
    if (process.env.NODE_ENV === 'development') {
      console.info(`[dev] Password reset OTP for ${user.email}: ${otp}`);
    }
  }
  return apiSuccess({ message: 'If the email exists, a reset code has been sent.' });
}
