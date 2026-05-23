import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { getLowStockProducts } from '@/lib/services/product.service';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getStockStatus, stockStatusStyles } from '@/lib/utils/stockStatus';

export default async function AlertsPage() {
  const session = await getSession();
  if (!session) return null;
  await dbConnect();
  const products = await getLowStockProducts(session.businessId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Low stock alerts</h1>
      <p className="text-sm text-text-secondary">{products.length} products need attention</p>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => {
          const status = getStockStatus(p.currentStock, p.reorderPoint);
          return (
            <Card key={p._id.toString()}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-text-secondary">SKU: {p.sku}</p>
                  <p className="mt-2 text-sm">
                    Stock: <strong>{p.currentStock}</strong> / Reorder at {p.reorderPoint}
                  </p>
                </div>
                <Badge className={stockStatusStyles[status]}>{status}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
      {!products.length && (
        <Card>
          <p className="text-center text-text-secondary">All products are above reorder levels.</p>
        </Card>
      )}
    </div>
  );
}
