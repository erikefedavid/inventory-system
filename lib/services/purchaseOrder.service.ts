import { Types } from 'mongoose';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { recordStockIn } from './transaction.service';
import { logAction } from '../utils/auditLogger';

export async function createPurchaseOrder({
  supplierId,
  items,
  expectedDelivery,
  notes,
  businessId,
  createdBy,
}: {
  supplierId: string;
  items: { productId: string; quantity: number; unitCost: number }[];
  expectedDelivery?: string;
  notes?: string;
  businessId: string;
  createdBy: string;
}) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await PurchaseOrder.countDocuments({ businessId });
  const seq = String(count + 1).padStart(4, '0');
  const orderNumber = `PO-${dateStr}-${seq}`;

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const po = new PurchaseOrder({
    orderNumber,
    supplier: new Types.ObjectId(supplierId),
    items: items.map((item) => ({
      product: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      unitCost: item.unitCost,
    })),
    status: 'draft',
    expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : undefined,
    totalCost,
    notes,
    createdBy: new Types.ObjectId(createdBy),
    businessId,
  });

  await po.save();

  await logAction({
    userId: createdBy,
    action: 'PURCHASE_ORDER_CREATED',
    entity: 'PurchaseOrder',
    entityId: po._id.toString(),
    after: po.toObject(),
  });

  return po.populate([
    { path: 'supplier', select: 'name contactPerson phone' },
    { path: 'items.product', select: 'name sku unit' },
  ]);
}

export async function listPurchaseOrders(filter: {
  businessId: string;
  supplierId?: string;
  status?: string;
}) {
  const query: Record<string, unknown> = { businessId: filter.businessId };
  if (filter.supplierId) query.supplier = new Types.ObjectId(filter.supplierId);
  if (filter.status) query.status = filter.status;

  return PurchaseOrder.find(query)
    .populate('supplier', 'name contactPerson phone')
    .populate('items.product', 'name sku unit')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
}

export async function getPurchaseOrder(id: string, businessId: string) {
  const po = await PurchaseOrder.findOne({ _id: id, businessId })
    .populate('supplier', 'name contactPerson phone email address')
    .populate('items.product', 'name sku unit costPrice sellingPrice')
    .populate('createdBy', 'name email');

  if (!po) throw new Error('Purchase order not found');
  return po;
}

export async function updatePurchaseOrder(
  id: string,
  data: {
    supplierId?: string;
    items?: { productId: string; quantity: number; unitCost: number }[];
    expectedDelivery?: string;
    notes?: string;
  },
  businessId: string,
  userId: string
) {
  const po = await PurchaseOrder.findOne({ _id: id, businessId });
  if (!po) throw new Error('Purchase order not found');

  if (po.status !== 'draft') {
    throw new Error('Can only update purchase orders that are in draft status');
  }

  const beforeState = po.toObject();

  if (data.supplierId) po.supplier = new Types.ObjectId(data.supplierId);
  if (data.expectedDelivery) po.expectedDelivery = new Date(data.expectedDelivery);
  if (data.notes !== undefined) po.notes = data.notes;

  if (data.items) {
    po.items = data.items.map((item) => ({
      product: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      unitCost: item.unitCost,
    }));
    po.totalCost = data.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }

  await po.save();

  await logAction({
    userId,
    action: 'PURCHASE_ORDER_UPDATED',
    entity: 'PurchaseOrder',
    entityId: po._id.toString(),
    before: beforeState,
    after: po.toObject(),
  });

  return po.populate([
    { path: 'supplier', select: 'name contactPerson phone' },
    { path: 'items.product', select: 'name sku unit' },
  ]);
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: 'draft' | 'sent' | 'received' | 'cancelled',
  businessId: string,
  userId: string
) {
  const po = await PurchaseOrder.findOne({ _id: id, businessId });
  if (!po) throw new Error('Purchase order not found');

  if (po.status === 'received' || po.status === 'cancelled') {
    throw new Error(`Cannot change status of a ${po.status} purchase order`);
  }

  const oldStatus = po.status;

  // Process Auto-Stock-In if changing to Received
  if (status === 'received') {
    for (const item of po.items) {
      await recordStockIn({
        userId,
        businessId,
        productId: item.product.toString(),
        quantity: item.quantity,
        supplierId: po.supplier.toString(),
        unitCost: item.unitCost,
        notes: `Auto-received from Purchase Order ${po.orderNumber}`,
      });
    }
  }

  po.status = status;
  await po.save();

  await logAction({
    userId,
    action: 'PURCHASE_ORDER_STATUS_CHANGED',
    entity: 'PurchaseOrder',
    entityId: po._id.toString(),
    before: { status: oldStatus },
    after: { status },
  });

  return po.populate([
    { path: 'supplier', select: 'name contactPerson phone' },
    { path: 'items.product', select: 'name sku unit' },
  ]);
}
