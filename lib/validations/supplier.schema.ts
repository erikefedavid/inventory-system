import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((id) => Types.ObjectId.isValid(id), 'Invalid ObjectId');

export const CreateSupplierSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1),
  address: z.string().optional(),
  productIds: z.array(objectId).optional(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();
