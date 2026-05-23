'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

interface SupplierItem {
  _id: string;
  name: string;
}

interface ProductItem {
  _id: string;
  name: string;
  sku: string;
  costPrice: number;
}

interface POFormProps {
  suppliers: SupplierItem[];
  products: ProductItem[];
}

interface LineItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

export function POForm({ suppliers, products }: POFormProps) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { productId: '', quantity: 1, unitCost: 0 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prodId = value as string;
      const product = products.find((p) => p._id === prodId);
      newItems[index] = {
        productId: prodId,
        quantity: newItems[index].quantity,
        unitCost: product ? product.costPrice : 0,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }

    const invalidItem = items.find((item) => !item.productId || item.quantity <= 0 || item.unitCost < 0);
    if (invalidItem) {
      setError('Please ensure all items are selected and have valid quantities and costs.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          items,
          expectedDelivery: expectedDelivery || undefined,
          notes: notes || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to create purchase order');
      }

      router.push('/purchase-orders');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Raise New Purchase Order</h1>
          <p className="text-sm text-text-secondary">Draft a purchase order to send to your vendor</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-red/35 bg-red-50 p-4 text-sm text-danger-red">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-semibold text-text-primary">Order Information</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Supplier <span className="text-danger-red">*</span></label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Expected Delivery Date</label>
              <Input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-semibold text-text-primary">Notes / Comments</h2>
            <textarea
              placeholder="Add any specific instructions, terms, or notes for the supplier..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 rounded-lg border border-border bg-white p-3 text-sm focus:border-accent-blue focus:outline-none resize-none"
            />
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-xl">
            <span className="text-sm font-semibold text-text-secondary uppercase">Grand Total</span>
            <span className="text-2xl font-bold text-accent-blue">{formatNaira(calculateTotal())}</span>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-semibold text-text-primary">Line Items</h2>
          <Button
            type="button"
            variant="ghost"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 text-accent-blue text-xs"
          >
            <Plus size={14} />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <div className="flex-[3] min-w-[200px] flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Product</label>
                <select
                  required
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-[1] min-w-[80px] flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex-[1.5] min-w-[120px] flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Unit Cost (₦)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={item.unitCost}
                  onChange={(e) => handleItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex-[1.5] min-w-[120px] flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-text-secondary uppercase">Subtotal</span>
                <span className="h-[38px] flex items-center font-semibold text-text-primary">
                  {formatNaira(item.quantity * item.unitCost)}
                </span>
              </div>

              <div className="flex items-end self-end h-[38px]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-danger-red hover:bg-red-50 disabled:opacity-30 rounded-lg"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => router.push('/purchase-orders')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Raising PO...' : 'Create Purchase Order'}
        </Button>
      </div>
    </form>
  );
}
