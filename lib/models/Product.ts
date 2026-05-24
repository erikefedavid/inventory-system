import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: Types.ObjectId;
  description?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderPoint: number;
  image?: string;
  supplier?: Types.ObjectId;
  isArchived: boolean;
  createdBy: Types.ObjectId;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String },
    unit: { type: String, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    currentStock: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 10 },
    image: { type: String },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
