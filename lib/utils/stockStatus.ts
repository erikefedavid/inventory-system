export type StockStatus = 'healthy' | 'low' | 'out';

export function getStockStatus(currentStock: number, reorderPoint: number): StockStatus {
  if (currentStock <= 0) return 'out';
  if (currentStock <= reorderPoint) return 'low';
  return 'healthy';
}

export const stockStatusStyles: Record<StockStatus, string> = {
  healthy: 'bg-green-100 text-success-green',
  low: 'bg-orange-100 text-warning-orange',
  out: 'bg-red-100 text-danger-red',
};
