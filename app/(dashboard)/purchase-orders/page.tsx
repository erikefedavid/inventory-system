import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { listPurchaseOrders } from '@/lib/services/purchaseOrder.service';
import { listSuppliers } from '@/lib/services/supplier.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Plus, Truck, AlertCircle, CheckCircle } from 'lucide-react';

interface SearchParams {
  supplierId?: string;
  status?: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  sent: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20 glow-warning',
  received: 'bg-success-green/10 text-success-green border-success-green/20',
  cancelled: 'bg-danger-red/10 text-danger-red border-danger-red/20',
};

export default async function PurchaseOrdersPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session) return null;
  await dbConnect();

  const selectedSupplierId = searchParams.supplierId;
  const selectedStatus = searchParams.status;

  const [pos, suppliers] = await Promise.all([
    listPurchaseOrders({
      businessId: session.businessId,
      supplierId: selectedSupplierId,
      status: selectedStatus,
    }),
    listSuppliers(session.businessId),
  ]);

  // Statistics
  const draftCount = pos.filter((p) => p.status === 'draft').length;
  const sentCount = pos.filter((p) => p.status === 'sent').length;
  const receivedValue = pos
    .filter((p) => p.status === 'received')
    .reduce((sum, p) => sum + p.totalCost, 0);

  const formatNaira = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Purchase Orders</h1>
          <p className="text-sm text-text-secondary">Procure stock from your verified suppliers</p>
        </div>
        {session.role !== 'clerk' && (
          <Link href="/purchase-orders/new">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Raise Purchase Order
            </Button>
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-premium flex items-center gap-4">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Draft Orders</p>
            <p className="text-2xl font-bold">{draftCount}</p>
          </div>
        </Card>
        <Card className="hover-premium flex items-center gap-4">
          <div className="rounded-xl bg-accent-blue/10 p-3 text-accent-blue">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Sent (Pending)</p>
            <p className="text-2xl font-bold">{sentCount}</p>
          </div>
        </Card>
        <Card className="hover-premium flex items-center gap-4">
          <div className="rounded-xl bg-success-green/10 p-3 text-success-green">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Received Value</p>
            <p className="text-2xl font-bold text-success-green">{formatNaira(receivedValue)}</p>
          </div>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-slate-50/50 p-4">
          <form method="GET" className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 min-w-[200px] flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Supplier</label>
              <select
                name="supplierId"
                defaultValue={selectedSupplierId || ''}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s._id.toString()} value={s._id.toString()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 min-w-[150px] flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Status</label>
              <select
                name="status"
                defaultValue={selectedStatus || ''}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end self-end">
              <Button variant="secondary" type="submit" className="h-[38px] px-6">
                Filter
              </Button>
            </div>
            {(selectedSupplierId || selectedStatus) && (
              <div className="flex items-end self-end">
                <Link href="/purchase-orders">
                  <Button variant="ghost" type="button" className="h-[38px]">
                    Reset
                  </Button>
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-text-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Order Number</th>
                <th className="px-6 py-4 font-semibold">Supplier</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Total Cost</th>
                <th className="px-6 py-4 font-semibold">Expected Delivery</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po._id.toString()} className="border-b border-border hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <Link
                      href={`/purchase-orders/${po._id.toString()}`}
                      className="font-semibold text-accent-blue hover:underline"
                    >
                      {po.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-text-primary">
                    {(po.supplier as { name?: string })?.name ?? 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {po.items.length} {po.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-text-primary">
                    {formatNaira(po.totalCost)}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {po.expectedDelivery
                      ? new Date(po.expectedDelivery).toLocaleDateString()
                      : 'Not specified'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`border uppercase text-[10px] font-bold px-2 py-1 rounded ${statusStyles[po.status]}`}>
                      {po.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/purchase-orders/${po._id.toString()}`}>
                      <Button variant="ghost" className="text-xs py-1 px-3">
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pos.length && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <AlertCircle size={40} className="text-slate-300 mb-2" />
              <p className="text-base font-semibold text-text-primary">No purchase orders found</p>
              <p className="text-sm text-text-secondary max-w-sm mt-1">
                Try resetting your filters or create a new purchase order to start procuring inventory.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
