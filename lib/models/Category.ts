import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

CategorySchema.index({ businessId: 1, name: 1 }, { unique: true });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
