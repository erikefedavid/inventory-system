import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { getInventoryValuation } from '@/lib/services/report.service';
import { getLowStockProducts, listProducts } from '@/lib/services/product.service';
import { ReportCenter } from '@/components/reports/ReportCenter';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  await dbConnect();

  const [valuation, lowStock, products] = await Promise.all([
    getInventoryValuation(session.businessId),
    getLowStockProducts(session.businessId),
    listProducts({ businessId: session.businessId }),
  ]);

  // Sanitize data for client serialization
  const sanitizedValuation = {
    categories: valuation.categories.map((c) => ({
      categoryName: c.categoryName,
      totalItems: c.totalItems,
      totalCostValue: c.totalCostValue,
      totalSellingValue: c.totalSellingValue,
    })),
    summary: {
      totalItemsCount: valuation.summary.totalItemsCount,
      grandCostValue: valuation.summary.grandCostValue,
      grandSellingValue: valuation.summary.grandSellingValue,
    },
  };

  const sanitizedLowStock = lowStock.map((item) => ({
    _id: item._id.toString(),
    name: item.name,
    sku: item.sku,
    currentStock: item.currentStock || 0,
    reorderPoint: item.reorderPoint || 0,
    unit: item.unit || 'pcs',
  }));

  const sanitizedProducts = products.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    sku: p.sku,
  }));

  return (
    <ReportCenter
      products={sanitizedProducts}
      initialValuation={sanitizedValuation}
      initialLowStock={sanitizedLowStock}
    />
  );
}
