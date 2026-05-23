import { Types } from 'mongoose';
import { Supplier } from '../models/Supplier';
import { logAction } from '../utils/auditLogger';

export async function listSuppliers(businessId: string, search?: string) {
  const query: Record<string, unknown> = { businessId, isArchived: false };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  return Supplier.find(query).sort({ name: 1 });
}

export async function createSupplier(data: {
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  productIds?: string[];
  businessId: string;
  userId: string;
}) {
  const supplier = new Supplier({
    name: data.name,
    contactPerson: data.contactPerson,
    email: data.email || undefined,
    phone: data.phone,
    address: data.address,
    products: data.productIds?.map((id) => new Types.ObjectId(id)),
    businessId: data.businessId,
  });
  await supplier.save();
  await logAction({
    userId: data.userId,
    action: 'SUPPLIER_CREATED',
    entity: 'Supplier',
    entityId: supplier._id.toString(),
    after: supplier.toObject(),
  });
  return supplier;
}

export async function getSupplier(id: string, businessId: string) {
  const supplier = await Supplier.findOne({ _id: id, businessId });
  if (!supplier) throw new Error('Supplier not found');
  return supplier;
}

export async function updateSupplier(
  id: string,
  data: Record<string, unknown>,
  businessId: string,
  userId: string
) {
  const update = { ...data };
  if (data.productIds) {
    update.products = (data.productIds as string[]).map((pid) => new Types.ObjectId(pid));
    delete update.productIds;
  }
  const supplier = await Supplier.findOneAndUpdate({ _id: id, businessId }, update, { new: true });
  if (!supplier) throw new Error('Supplier not found');
  await logAction({
    userId,
    action: 'SUPPLIER_UPDATED',
    entity: 'Supplier',
    entityId: supplier._id.toString(),
    after: supplier.toObject(),
  });
  return supplier;
}

export async function archiveSupplier(id: string, businessId: string, userId: string) {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: id, businessId },
    { isArchived: true },
    { new: true }
  );
  if (!supplier) throw new Error('Supplier not found');
  await logAction({
    userId,
    action: 'SUPPLIER_ARCHIVED',
    entity: 'Supplier',
    entityId: supplier._id.toString(),
  });
  return supplier;
}
