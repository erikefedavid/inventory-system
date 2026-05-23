import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { listProducts } from '@/lib/services/product.service';
import { ProductTable } from '@/components/inventory/ProductTable';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { Input } from '@/components/ui/Input';
import { redirect } from 'next/navigation';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  await dbConnect();

  const { search, categoryId } = await searchParams;

  let products: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    products = await listProducts({
      businessId: session.businessId,
      search,
      categoryId,
    });
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
      <form method="GET" className="flex gap-3">
        <Input
          name="search"
          placeholder="Search by name or SKU..."
          defaultValue={search}
          className="max-w-sm"
        />
        <button type="submit" className="rounded-lg bg-accent-blue px-4 text-sm text-white">Search</button>
        {search && <a href="/inventory" className="self-center text-xs text-accent-blue hover:underline">Clear</a>}
      </form>
      <ProductTable
        products={JSON.parse(JSON.stringify(products))}
      />
    </div>
  );
}
