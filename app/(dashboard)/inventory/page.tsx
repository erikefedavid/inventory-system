import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { listProducts } from '@/lib/services/product.service';
import { ProductTable } from '@/components/inventory/ProductTable';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { redirect } from 'next/navigation';

export default async function InventoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  await dbConnect();

  let products: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    products = await listProducts({ businessId: session.businessId });
  } catch {
    return <p className="text-danger-red">Could not load products. Is MongoDB running?</p>;
  }

  const canManage = session.role === 'admin' || session.role === 'manager';
  const isAdmin = session.role === 'admin';

  return (
    <div className="space-y-6">
      <InventoryHeader
        productCount={products.length}
        canManage={canManage}
        isAdmin={isAdmin}
      />
      <ProductTable
        products={JSON.parse(JSON.stringify(products))}
      />
    </div>
  );
}
