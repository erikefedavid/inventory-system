import { Types } from 'mongoose';
import { StockTransaction } from '../models/StockTransaction';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';

async function auditTx(
  userId: string,
  action: string,
  txId: Types.ObjectId,
  after: Record<string, unknown>
) {
  await AuditLog.create({
    user: new Types.ObjectId(userId),
    action,
    entity: 'StockTransaction',
    entityId: txId,
    after,
    ipAddress: 'unknown',
  });
}

export async function recordStockIn({
  userId,
  businessId,
  productId,
  quantity,
  supplierId,
  unitCost,
  notes,
}: {
  userId: string;
  businessId: string;
  productId: string;
  quantity: number;
  supplierId?: string;
  unitCost?: number;
  notes?: string;
}) {
  if (quantity <= 0) throw new Error('Quantity must be greater than zero');
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) throw new Error('Product not found');
  const previousStock = product.currentStock ?? 0;
  const newStock = previousStock + quantity;

  const tx = new StockTransaction({
    product: product._id,
    type: 'stock_in',
    quantity,
    previousStock,
    newStock,
    unitCost,
    supplier: supplierId ? new Types.ObjectId(supplierId) : undefined,
    performedBy: new Types.ObjectId(userId),
    businessId,
    notes,
  });
  await tx.save();
  product.currentStock = newStock;
  await product.save();
  await auditTx(userId, 'STOCK_IN_RECORDED', tx._id as Types.ObjectId, {
    productId: product._id,
    newStock,
  });
  return tx;
}

export async function recordStockOut({
  userId,
  businessId,
  productId,
  quantity,
  reason,
  notes,
  allowOverride = false,
}: {
  userId: string;
  businessId: string;
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
  allowOverride?: boolean;
}) {
  if (quantity <= 0) throw new Error('Quantity must be greater than zero');
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) throw new Error('Product not found');
  const previousStock = product.currentStock ?? 0;
  if (quantity > previousStock && !allowOverride) {
    throw new Error('Insufficient stock for this operation');
  }
  const newStock = Math.max(0, previousStock - quantity);

  const tx = new StockTransaction({
    product: product._id,
    type: 'stock_out',
    quantity,
    previousStock,
    newStock,
    reason,
    performedBy: new Types.ObjectId(userId),
    businessId,
    notes,
  });
  await tx.save();
  product.currentStock = newStock;
  await product.save();
  await auditTx(userId, 'STOCK_OUT_RECORDED', tx._id as Types.ObjectId, {
    productId: product._id,
    newStock,
  });
  return tx;
}

export async function recordAdjustment({
  userId,
  businessId,
  productId,
  quantity,
  reason,
  notes,
}: {
  userId: string;
  businessId: string;
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}) {
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) throw new Error('Product not found');
  const previousStock = product.currentStock ?? 0;
  const newStock = previousStock + quantity;
  if (newStock < 0) throw new Error('Resulting stock cannot be negative');

  const tx = new StockTransaction({
    product: product._id,
    type: 'adjustment',
    quantity: Math.abs(quantity),
    previousStock,
    newStock,
    reason,
    performedBy: new Types.ObjectId(userId),
    businessId,
    notes,
  });
  await tx.save();
  product.currentStock = newStock;
  await product.save();
  await auditTx(userId, 'STOCK_ADJUSTMENT', tx._id as Types.ObjectId, {
    productId: product._id,
    newStock,
  });
  return tx;
}

export async function listTransactions(filter: {
  businessId: string;
  productId?: string;
  type?: string;
  limit?: number;
}) {
  const query: Record<string, unknown> = { businessId: filter.businessId };
  if (filter.productId) query.product = new Types.ObjectId(filter.productId);
  if (filter.type) query.type = filter.type;
  return StockTransaction.find(query)
    .populate('product', 'name sku')
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(filter.limit ?? 50);
}
