import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((id) => Types.ObjectId.isValid(id), {
  message: 'Invalid MongoDB ObjectId',
});

export const StockInSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int().positive(),
  supplierId: objectIdSchema.optional(),
  unitCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const StockOutSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export const AdjustmentSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export type StockInRequest = z.infer<typeof StockInSchema>;
export type StockOutRequest = z.infer<typeof StockOutSchema>;
export type AdjustmentRequest = z.infer<typeof AdjustmentSchema>;
