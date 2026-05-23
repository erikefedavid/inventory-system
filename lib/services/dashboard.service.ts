import { Product } from '../models/Product';
import { StockTransaction } from '../models/StockTransaction';

export async function getDashboardStats(businessId: string) {
  const [totalProducts, products, recentTransactions, todayCounts] = await Promise.all([
    Product.countDocuments({ businessId, isArchived: false }),
    Product.find({ businessId, isArchived: false }).select('currentStock costPrice reorderPoint'),
    StockTransaction.find({ businessId })
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10),
    getTodayTransactionCounts(businessId),
  ]);

  let totalStockValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const p of products) {
    totalStockValue += (p.currentStock ?? 0) * (p.costPrice ?? 0);
    if ((p.currentStock ?? 0) === 0) outOfStockCount++;
    else if ((p.currentStock ?? 0) <= (p.reorderPoint ?? 10)) lowStockCount++;
  }

  return {
    totalProducts,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    recentTransactions,
    todayStockIns: todayCounts.stockIns,
    todayStockOuts: todayCounts.stockOuts,
    todayTransactions: todayCounts.total,
  };
}

async function getTodayTransactionCounts(businessId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const txs = await StockTransaction.find({ businessId, createdAt: { $gte: start } });
  return {
    stockIns: txs.filter((t) => t.type === 'stock_in').length,
    stockOuts: txs.filter((t) => t.type === 'stock_out').length,
    total: txs.length,
  };
}

export async function getMovementChartData(businessId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const txs = await StockTransaction.find({
    businessId,
    createdAt: { $gte: since },
  }).populate('product', 'name');

  const map = new Map<string, number>();
  for (const tx of txs) {
    const name = (tx.product as { name?: string })?.name ?? 'Unknown';
    map.set(name, (map.get(name) ?? 0) + tx.quantity);
  }
  return Array.from(map.entries())
    .map(([name, movement]) => ({ name, movement }))
    .sort((a, b) => b.movement - a.movement)
    .slice(0, 10);
}
