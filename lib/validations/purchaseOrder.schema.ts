import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((id) => Types.ObjectId.isValid(id), 'Invalid ObjectId');

const PurchaseOrderItemSchema = z.object({
  productId: objectId,
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitCost: z.number().nonnegative('Unit cost cannot be negative'),
});

export const CreatePurchaseOrderSchema = z.object({
  supplierId: objectId,
  items: z.array(PurchaseOrderItemSchema).min(1, 'At least one item is required'),
  expectedDelivery: z.string().datetime().optional().or(z.string().optional()),
  notes: z.string().optional(),
});

export const UpdatePurchaseOrderSchema = CreatePurchaseOrderSchema.partial();
