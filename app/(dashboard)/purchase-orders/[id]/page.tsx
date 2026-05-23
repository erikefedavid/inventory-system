import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { getPurchaseOrder } from '@/lib/services/purchaseOrder.service';
import { PODetailView } from '@/components/purchase-orders/PODetailView';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect('/login');
  await dbConnect();

  try {
    const { id } = await params;
    const po = await getPurchaseOrder(id, session.businessId);

    // Clean PO object for Client Component serializability
    const sanitizedPo = {
      _id: po._id.toString(),
      orderNumber: po.orderNumber,
      supplier: {
        _id: po.supplier._id.toString(),
        name: (po.supplier as any).name,
        contactPerson: (po.supplier as any).contactPerson,
        phone: (po.supplier as any).phone,
        email: (po.supplier as any).email,
        address: (po.supplier as any).address,
      },
      items: po.items.map((item, idx) => ({
        _id: (item as any)._id?.toString() || String(idx),
        product: {
          _id: (item.product as any)._id?.toString() || (item.product as any).toString(),
          name: (item.product as any).name,
          sku: (item.product as any).sku,
          unit: (item.product as any).unit,
        },
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
      status: po.status,
      expectedDelivery: po.expectedDelivery ? po.expectedDelivery.toISOString() : undefined,
      totalCost: po.totalCost,
      notes: po.notes,
      createdBy: {
        name: (po.createdBy as any).name,
        email: (po.createdBy as any).email,
      },
      createdAt: (po as any).createdAt ? (po as any).createdAt.toISOString() : new Date().toISOString(),
    };

    const canManage = session.role === 'admin' || session.role === 'manager';

    return <PODetailView po={sanitizedPo} canManage={canManage} />;
  } catch (e: unknown) {
    console.error(e);
    return (
      <div className="rounded-lg border border-danger-red/30 bg-red-50 p-6 text-sm text-danger-red">
        Purchase Order not found or you are not authorized to view it.
      </div>
    );
  }
}
