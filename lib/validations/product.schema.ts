import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((id) => Types.ObjectId.isValid(id), 'Invalid ObjectId');

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  categoryId: objectId,
  unit: z.string().min(1),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  description: z.string().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
  supplierId: objectId.optional(),
  image: z.string().url().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
