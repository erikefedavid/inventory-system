'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { getStockStatus, stockStatusStyles } from '@/lib/utils/stockStatus';

export interface ProductRow {
  _id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  sellingPrice: number;
  category?: { name?: string };
}

export function ProductTable({ products }: { products: ProductRow[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-text-secondary">
        No products yet. Add your first product to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-text-secondary">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const status = getStockStatus(p.currentStock, p.reorderPoint);
            return (
              <tr key={p._id} className="border-t border-border hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/inventory/${p._id}`} className="font-medium text-accent-blue hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">{p.sku}</td>
                <td className="px-4 py-3">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3">{p.currentStock}</td>
                <td className="px-4 py-3">
                  <Badge className={stockStatusStyles[status]}>{status}</Badge>
                </td>
                <td className="px-4 py-3">₦{p.sellingPrice.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
