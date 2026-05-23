import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment';

export interface IStockTransaction extends Document {
  product: Types.ObjectId;
  type: TransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  reason?: string;
  supplier?: Types.ObjectId;
  purchaseOrder?: Types.ObjectId;
  performedBy: Types.ObjectId;
  businessId: string;
  notes?: string;
  createdAt: Date;
}

const StockTransactionSchema = new Schema<IStockTransaction>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['stock_in', 'stock_out', 'adjustment'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    unitCost: { type: Number },
    reason: { type: String },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: String, required: true, index: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const StockTransaction: Model<IStockTransaction> =
  mongoose.models.StockTransaction ||
  mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);
