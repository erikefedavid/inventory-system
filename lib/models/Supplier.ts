import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  products?: Types.ObjectId[];
  isArchived: boolean;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isArchived: { type: Boolean, default: false },
    businessId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
