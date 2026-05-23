import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { User, type UserRole } from '../models/User';
import { logAction } from '../utils/auditLogger';

export async function listUsers(businessId: string) {
  return User.find({ businessId }).select('-password -resetToken -resetTokenExpiry');
}

export async function createStaffUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  businessId: string;
  businessName: string;
  adminId: string;
}) {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('User already exists');
  const hashed = await bcrypt.hash(data.password, 12);
  const user = new User({
    name: data.name,
    email: data.email,
    password: hashed,
    role: data.role,
    businessName: data.businessName,
    businessId: data.businessId,
  });
  await user.save();
  await logAction({
    userId: data.adminId,
    action: 'USER_CREATED',
    entity: 'User',
    entityId: user._id.toString(),
    after: { email: user.email, role: user.role },
  });
  const obj = user.toObject();
  delete (obj as { password?: string }).password;
  return obj;
}

export async function updateUser(
  id: string,
  data: { role?: UserRole; isActive?: boolean; name?: string; phone?: string },
  businessId: string,
  adminId: string
) {
  const user = await User.findOneAndUpdate({ _id: id, businessId }, data, { new: true }).select(
    '-password -resetToken -resetTokenExpiry'
  );
  if (!user) throw new Error('User not found');
  await logAction({
    userId: adminId,
    action: 'USER_UPDATED',
    entity: 'User',
    entityId: user._id.toString(),
    after: data,
  });
  return user;
}

export async function deactivateUser(id: string, businessId: string, adminId: string) {
  return updateUser(id, { isActive: false }, businessId, adminId);
}
