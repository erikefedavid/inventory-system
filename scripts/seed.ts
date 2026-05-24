import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const {
  MONGODB_URI,
  DEFAULT_ADMIN_EMAIL = 'admin@stockpilot.com',
  DEFAULT_ADMIN_PASSWORD = 'AdminPassword123!',
  DEFAULT_ADMIN_BUSINESS = 'PilotRetail',
} = process.env;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);

  const existingUser = mongoose.connection.db!.collection('users').findOne({ email: { $regex: new RegExp(`^${DEFAULT_ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
  if (await existingUser) {
    console.log('Admin user already exists. Skipping seed.');
    await mongoose.disconnect();
    return;
  }

  const password = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  const businessId = randomBytes(12).toString('hex');

  await mongoose.connection.db!.collection('users').insertOne({
    name: 'Admin',
    email: DEFAULT_ADMIN_EMAIL,
    password,
    role: 'admin',
    businessName: DEFAULT_ADMIN_BUSINESS,
    businessId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`Seeded admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
