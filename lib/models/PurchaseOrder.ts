import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPurchaseOrder extends Document {
  orderNumber: string;
  supplier: Types.ObjectId;
  items: {
    product: Types.ObjectId;
    quantity: number;
    unitCost: number;
  }[];
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  expectedDelivery?: Date;
  totalCost: number;
  notes?: string;
  createdBy: Types.ObjectId;
  businessId: string;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type: Number, required: true, min: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'sent', 'received', 'cancelled'],
      default: 'draft',
    },
    expectedDelivery: { type: Date },
    totalCost: { type: Number, required: true, min: 0 },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const PurchaseOrder: Model<IPurchaseOrder> =
  mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
