import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { getProduct } from '@/lib/services/product.service';
import { StockTransaction } from '@/lib/models/StockTransaction';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStockStatus, stockStatusStyles } from '@/lib/utils/stockStatus';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  await dbConnect();

  try {
    const product = await getProduct(id, session.businessId);
    const transactions = await StockTransaction.find({ product: id, businessId: session.businessId })
      .sort({ createdAt: -1 })
      .limit(20);
    const status = getStockStatus(product.currentStock, product.reorderPoint);

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-text-secondary">SKU: {product.sku}</p>
          </div>
          <Badge className={stockStatusStyles[status]}>{status}</Badge>
        </div>
        <Link href={`/inventory/${id}/edit`}>
          <Button variant="ghost" className="text-xs">Edit product</Button>
        </Link>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-text-secondary">Current stock</p>
            <p className="text-2xl font-bold">{product.currentStock}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Reorder point</p>
            <p className="text-2xl font-bold">{product.reorderPoint}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Selling price</p>
            <p className="text-2xl font-bold">₦{product.sellingPrice.toLocaleString()}</p>
          </Card>
        </div>
        <Card>
          <h2 className="mb-4 font-semibold">Transaction history</h2>
          <ul className="space-y-2 text-sm">
            {transactions.map((tx) => (
              <li key={tx._id.toString()} className="flex justify-between border-b border-border py-2">
                <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                <span>Qty {tx.quantity} → {tx.newStock}</span>
                <span className="text-text-secondary">{new Date(tx.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  } catch {
    notFound();
  }
}
