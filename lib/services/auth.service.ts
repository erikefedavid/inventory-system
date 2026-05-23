// lib/services/auth.service.ts
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Types } from "mongoose";
import { signJwt } from "../utils/jwt";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  businessName: string;
  role: "admin" | "manager" | "clerk";
}) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("User already exists");
  }
  const hashed = await bcrypt.hash(data.password, 12);
  const businessId = new Types.ObjectId().toString();
  const user = new User({
    name: data.name,
    email: data.email,
    password: hashed,
    role: data.role,
    businessName: data.businessName,
    businessId,
  });
  await user.save();
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const token = await signJwt({
    sub: user._id.toString(),
    role: user.role,
    businessId: user.businessId,
  });
  return { token, user };
}
