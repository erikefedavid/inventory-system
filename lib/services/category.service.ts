import { Types } from 'mongoose';
import { Category } from '../models/Category';
import { logAction } from '../utils/auditLogger';

export async function listCategories(businessId: string) {
  return Category.find({ businessId }).sort({ name: 1 });
}

export async function createCategory(data: {
  name: string;
  description?: string;
  businessId: string;
  createdBy: string;
}) {
  const category = new Category({
    name: data.name,
    description: data.description,
    businessId: data.businessId,
    createdBy: new Types.ObjectId(data.createdBy),
  });
  await category.save();
  await logAction({
    userId: data.createdBy,
    action: 'CATEGORY_CREATED',
    entity: 'Category',
    entityId: category._id.toString(),
    after: category.toObject(),
  });
  return category;
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string },
  businessId: string,
  userId: string
) {
  const category = await Category.findOneAndUpdate({ _id: id, businessId }, data, { new: true });
  if (!category) throw new Error('Category not found');
  await logAction({
    userId,
    action: 'CATEGORY_UPDATED',
    entity: 'Category',
    entityId: category._id.toString(),
    after: category.toObject(),
  });
  return category;
}

export async function archiveCategory(id: string, businessId: string, userId: string) {
  const result = await Category.deleteOne({ _id: id, businessId });
  if (result.deletedCount === 0) throw new Error('Category not found');
  await logAction({
    userId,
    action: 'CATEGORY_DELETED',
    entity: 'Category',
    entityId: id,
  });
}
