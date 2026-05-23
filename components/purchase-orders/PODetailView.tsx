'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  FileText,
  Calendar,
  User,
  Truck,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  Download,
  AlertCircle,
} from 'lucide-react';

interface POItem {
  product: {
    _id: string;
    name: string;
    sku: string;
    unit: string;
  };
  quantity: number;
  unitCost: number;
  _id: string;
}

interface PurchaseOrderData {
  _id: string;
  orderNumber: string;
  supplier: {
    _id: string;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: POItem[];
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  expectedDelivery?: string;
  totalCost: number;
  notes?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PODetailViewProps {
  po: PurchaseOrderData;
  canManage: boolean;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  sent: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20 glow-warning',
  received: 'bg-success-green/10 text-success-green border-success-green/20',
  cancelled: 'bg-danger-red/10 text-danger-red border-danger-red/20',
};

export function PODetailView({ po: initialPo, canManage }: PODetailViewProps) {
  const router = useRouter();
  const [po, setPo] = useState<PurchaseOrderData>(initialPo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatNaira = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

  const handleStatusChange = async (newStatus: 'sent' | 'received' | 'cancelled') => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/purchase-orders/${po._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update order status');
      }

      setPo(result.data);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Premium Corporate Branded Header
    doc.setFillColor(26, 58, 107); // --primary-blue: #1A3A6B
    doc.rect(0, 0, 210, 35, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('StockPilot', 15, 18);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Inventory & Stock Procurement Management System', 15, 25);

    // Document Metadata
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('PURCHASE ORDER', 140, 15);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Order No: ${po.orderNumber}`, 140, 21);
    doc.text(`Date: ${new Date(po.createdAt).toLocaleDateString()}`, 140, 26);
    doc.text(`Status: ${po.status.toUpperCase()}`, 140, 31);

    // Business & Supplier Info Layout
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('SUPPLIER / VENDOR DETAILS:', 15, 50);
    doc.text('SHIP TO / DELIVER TO:', 120, 50);

    doc.setFontSize(9.5);
    doc.setFont('Helvetica', 'normal');
    doc.text([
      po.supplier.name,
      `Contact: ${po.supplier.contactPerson || 'N/A'}`,
      `Phone: ${po.supplier.phone}`,
      `Email: ${po.supplier.email || 'N/A'}`,
      `Address: ${po.supplier.address || 'N/A'}`,
    ], 15, 56);

    doc.text([
      'SME Business Entity',
      'StockPilot Warehouse Facility',
      po.expectedDelivery 
        ? `Expected Arrival: ${new Date(po.expectedDelivery).toLocaleDateString()}` 
        : 'Arrival: As agreed',
      `Issued By: ${po.createdBy.name}`,
    ], 120, 56);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 90, 195, 90);

    // Item Table
    const tableBody = po.items.map((item, i) => [
      i + 1,
      item.product.name,
      item.product.sku,
      item.quantity,
      `NGN ${item.unitCost.toLocaleString()}`,
      `NGN ${(item.quantity * item.unitCost).toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      startY: 95,
      head: [['#', 'Product Name', 'SKU', 'Qty', 'Unit Cost', 'Subtotal']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [26, 58, 107], halign: 'left' },
      styles: { fontSize: 8.5 },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Totals Box
    doc.setFillColor(248, 250, 252);
    doc.rect(125, finalY, 70, 20, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(125, finalY, 70, 20, 'S');

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('GRAND TOTAL:', 130, finalY + 12);
    doc.setTextColor(37, 99, 235); // accent blue
    doc.setFontSize(11);
    doc.text(`NGN ${po.totalCost.toLocaleString()}`, 158, finalY + 12);

    // Notes Section
    if (po.notes) {
      doc.setTextColor(100, 116, 139); // text secondary
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'bold');
      doc.text('IMPORTANT PROCUREMENT INSTRUCTIONS & NOTES:', 15, finalY + 5);
      doc.setFont('Helvetica', 'normal');
      
      const splitNotes = doc.splitTextToSize(po.notes, 100);
      doc.text(splitNotes, 15, finalY + 10);
    }

    // Branded Footer
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.text('This is an official procurement invoice generated via StockPilot inventory management platform.', 15, 280);
    doc.text('Page 1 of 1', 185, 280);

    doc.save(`PO-${po.orderNumber}.pdf`);
  };

  const steps = ['draft', 'sent', 'received'];
  const currentStepIdx = steps.indexOf(po.status === 'cancelled' ? 'sent' : po.status);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back link */}
      <button
        onClick={() => router.push('/purchase-orders')}
        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-blue transition font-semibold"
      >
        <ArrowLeft size={14} />
        Back to list
      </button>

      {/* Header and actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">{po.orderNumber}</h1>
            <Badge className={`border uppercase text-[10px] font-bold px-2 py-1 rounded ${statusStyles[po.status]}`}>
              {po.status}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Issued on {new Date(po.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="flex items-center gap-1.5" onClick={handleExportPDF}>
            <Download size={15} />
            Export Invoice PDF
          </Button>

          {canManage && po.status === 'draft' && (
            <>
              <Button
                variant="danger"
                disabled={loading}
                onClick={() => handleStatusChange('cancelled')}
                className="flex items-center gap-1.5"
              >
                <XCircle size={15} />
                Cancel Order
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleStatusChange('sent')}
                className="flex items-center gap-1.5 bg-accent-blue text-white"
              >
                <Send size={15} />
                Send Order
              </Button>
            </>
          )}

          {canManage && po.status === 'sent' && (
            <>
              <Button
                variant="danger"
                disabled={loading}
                onClick={() => handleStatusChange('cancelled')}
                className="flex items-center gap-1.5"
              >
                <XCircle size={15} />
                Cancel Order
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleStatusChange('received')}
                className="flex items-center gap-1.5 bg-success-green hover:bg-success-green/90 text-white"
              >
                <CheckCircle size={15} />
                Mark as Received
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-red/35 bg-red-50 p-4 text-sm text-danger-red">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stepper tracker */}
      {po.status !== 'cancelled' ? (
        <Card className="py-6 px-12 bg-white">
          <div className="relative flex items-center justify-between w-full">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-100 w-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent-blue transition-all duration-300 z-0"
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const active = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="flex flex-col items-center z-10 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                      isCurrent
                        ? 'bg-accent-blue text-white border-accent-blue ring-4 ring-blue-100'
                        : active
                        ? 'bg-accent-blue text-white border-accent-blue'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                      idx <= currentStepIdx ? 'text-accent-blue' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="py-4 px-6 border-danger-red/30 bg-red-50/50 text-danger-red flex items-center gap-3">
          <XCircle size={22} />
          <div>
            <h3 className="font-semibold text-sm">Purchase Order Cancelled</h3>
            <p className="text-xs opacity-90">
              This order has been voided. No stock adjustment occurred and this invoice is read-only.
            </p>
          </div>
        </Card>
      )}

      {/* Details invoices layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Supplier details box */}
        <Card className="md:col-span-1 space-y-4">
          <h2 className="font-semibold text-sm text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Supplier Details
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-text-secondary">Vendor Company</p>
              <p className="font-semibold text-text-primary">{po.supplier.name}</p>
            </div>
            {po.supplier.contactPerson && (
              <div>
                <p className="text-xs text-text-secondary">Contact Person</p>
                <p className="font-medium">{po.supplier.contactPerson}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-secondary">Phone Number</p>
              <p className="font-medium">{po.supplier.phone}</p>
            </div>
            {po.supplier.email && (
              <div>
                <p className="text-xs text-text-secondary">Email Address</p>
                <p className="font-medium break-all">{po.supplier.email}</p>
              </div>
            )}
            {po.supplier.address && (
              <div>
                <p className="text-xs text-text-secondary">Location</p>
                <p className="text-xs">{po.supplier.address}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Details box */}
        <Card className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
              Procured Line Items
            </h2>
            <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Expected: {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <User size={13} />
                By: {po.createdBy.name}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-text-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3 text-center">Quantity</th>
                  <th className="px-6 py-3 text-right">Unit Cost</th>
                  <th className="px-6 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item) => (
                  <tr key={item._id} className="border-b border-border/50 hover:bg-slate-50/30">
                    <td className="px-6 py-3 font-semibold text-text-primary">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-3 text-text-secondary">{item.product.sku}</td>
                    <td className="px-6 py-3 text-center">{item.quantity} {item.product.unit}</td>
                    <td className="px-6 py-3 text-right font-medium text-text-secondary">
                      {formatNaira(item.unitCost)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-text-primary">
                      {formatNaira(item.quantity * item.unitCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1.5 border-t border-border pt-4">
            <span className="text-xs font-semibold text-text-secondary uppercase">Order Total</span>
            <span className="text-2xl font-bold text-accent-blue">{formatNaira(po.totalCost)}</span>
          </div>

          {po.notes && (
            <div className="rounded-lg bg-slate-50 border border-border p-4 text-xs space-y-1">
              <span className="font-semibold text-text-secondary uppercase">Procurement Notes / Terms</span>
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{po.notes}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
