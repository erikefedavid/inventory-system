import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { listSuppliers } from '@/lib/services/supplier.service';
import { listProducts } from '@/lib/services/product.service';
import { POForm } from '@/components/purchase-orders/POForm';

export default async function NewPurchaseOrderPage() {
  const session = await getSession();
  if (!session) return null;
  await dbConnect();

  const [suppliers, products] = await Promise.all([
    listSuppliers(session.businessId),
    listProducts({ businessId: session.businessId }),
  ]);

  // Clean data for client components
  const sanitizedSuppliers = suppliers.map((s) => ({
    _id: s._id.toString(),
    name: s.name,
  }));

  const sanitizedProducts = products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    sku: p.sku,
    costPrice: p.costPrice || 0,
  }));

  return (
    <POForm
      suppliers={sanitizedSuppliers}
      products={sanitizedProducts}
    />
  );
}
