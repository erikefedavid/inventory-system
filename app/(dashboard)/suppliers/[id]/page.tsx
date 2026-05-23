import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { getSupplier } from '@/lib/services/supplier.service';
import { PurchaseOrder } from '@/lib/models/PurchaseOrder';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { id } = await params;
  await dbConnect();

  try {
    const [supplier, purchaseOrders] = await Promise.all([
      getSupplier(id, session.businessId),
      PurchaseOrder.find({ supplier: id, businessId: session.businessId })
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-text-secondary">{supplier.contactPerson ? `Contact: ${supplier.contactPerson}` : ''}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-text-secondary">Phone</p>
            <p className="font-medium">{supplier.phone}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Email</p>
            <p className="font-medium">{supplier.email || '—'}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">Address</p>
            <p className="font-medium">{supplier.address || '—'}</p>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 font-semibold">Purchase orders ({purchaseOrders.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="pb-2 pr-4">Order #</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Items</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po._id.toString()} className="border-b border-border/50">
                    <td className="py-2 pr-4">
                      <Link href={`/purchase-orders/${po._id}`} className="text-accent-blue hover:underline">
                        {po.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2 pr-4"><Badge>{po.status}</Badge></td>
                    <td className="py-2 pr-4">{po.items?.length ?? 0}</td>
                    <td className="py-2 pr-4">₦{(po.totalCost ?? 0).toLocaleString()}</td>
                    <td className="py-2 text-text-secondary">{new Date(po.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!purchaseOrders.length && (
              <p className="py-6 text-center text-text-secondary">No purchase orders yet</p>
            )}
          </div>
        </Card>
      </div>
    );
  } catch {
    notFound();
  }
}
