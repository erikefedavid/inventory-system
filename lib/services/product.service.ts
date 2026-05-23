import { Types } from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { generateSku } from '../utils/skuGenerator';
import { logAction } from '../utils/auditLogger';

export async function createProduct(data: {
  name: string;
  sku?: string;
  categoryId: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  reorderPoint?: number;
  supplierId?: string;
  image?: string;
  businessId: string;
  createdBy: string;
}) {
  const category = await Category.findOne({ _id: data.categoryId, businessId: data.businessId });
  if (!category) throw new Error('Category not found');

  const count = await Product.countDocuments({ businessId: data.businessId });
  const sku = data.sku ?? generateSku('SP', count + 1);

  const product = new Product({
    name: data.name,
    sku,
    category: new Types.ObjectId(data.categoryId),
    description: data.description,
    unit: data.unit,
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    reorderPoint: data.reorderPoint ?? 10,
    supplier: data.supplierId ? new Types.ObjectId(data.supplierId) : undefined,
    image: data.image,
    createdBy: new Types.ObjectId(data.createdBy),
    businessId: data.businessId,
  });
  await product.save();
  await logAction({
    userId: data.createdBy,
    action: 'PRODUCT_CREATED',
    entity: 'Product',
    entityId: product._id.toString(),
    after: product.toObject(),
  });
  return product.populate('category');
}

export async function listProducts(filter: {
  businessId: string;
  search?: string;
  categoryId?: string;
  includeArchived?: boolean;
}) {
  const query: Record<string, unknown> = { businessId: filter.businessId };
  if (!filter.includeArchived) query.isArchived = false;
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { sku: { $regex: filter.search, $options: 'i' } },
    ];
  }
  if (filter.categoryId) query.category = new Types.ObjectId(filter.categoryId);
  return Product.find(query).populate('category').sort({ createdAt: -1 });
}

export async function getLowStockProducts(businessId: string) {
  return Product.find({
    businessId,
    isArchived: false,
    $expr: { $lte: ['$currentStock', '$reorderPoint'] },
  }).populate('category');
}

export async function getProduct(id: string, businessId: string) {
  const product = await Product.findOne({ _id: id, businessId }).populate('category');
  if (!product) throw new Error('Product not found');
  return product;
}

export async function updateProduct(
  id: string,
  data: Record<string, unknown>,
  businessId: string,
  userId: string
) {
  const update: Record<string, unknown> = { ...data };
  if (data.categoryId) {
    update.category = new Types.ObjectId(data.categoryId as string);
    delete update.categoryId;
  }
  if (data.supplierId) {
    update.supplier = new Types.ObjectId(data.supplierId as string);
    delete update.supplierId;
  }
  const product = await Product.findOneAndUpdate({ _id: id, businessId }, update, { new: true }).populate(
    'category'
  );
  if (!product) throw new Error('Product not found');
  await logAction({
    userId,
    action: 'PRODUCT_UPDATED',
    entity: 'Product',
    entityId: product._id.toString(),
    after: product.toObject(),
  });
  return product;
}

export async function archiveProduct(id: string, businessId: string, userId: string) {
  const product = await Product.findOneAndUpdate(
    { _id: id, businessId },
    { isArchived: true },
    { new: true }
  );
  if (!product) throw new Error('Product not found');
  await logAction({
    userId,
    action: 'PRODUCT_ARCHIVED',
    entity: 'Product',
    entityId: product._id.toString(),
    after: product.toObject(),
  });
  return product;
}
