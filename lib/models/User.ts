import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'clerk';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // bcrypt hashed
  role: UserRole;
  businessName: string;
  businessId: string; // reference to business (could be businessName or ObjectId if separate collection)
  phone?: string;
  avatar?: string; // Cloudinary URL
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'clerk'], default: 'clerk' },
    businessName: { type: String, required: true },
    businessId: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
