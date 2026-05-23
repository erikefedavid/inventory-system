'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/products', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    let url = '/api/v1/transactions/stock-in';
    let body: Record<string, unknown> = { productId, quantity, notes };
    if (type === 'stock_out') {
      url = '/api/v1/transactions/stock-out';
      body = { productId, quantity, reason, notes };
    } else if (type === 'adjustment') {
      url = '/api/v1/transactions/adjustment';
      body = { productId, quantity, reason, notes };
    }
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Transaction failed');
      return;
    }
    router.push('/transactions');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Record stock</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <select
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
          >
            <option value="stock_in">Stock in</option>
            <option value="stock_out">Stock out</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
            required
          />
          {(type === 'stock_out' || type === 'adjustment') && (
            <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
          )}
          <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <p className="text-sm text-danger-red">{error}</p>}
          <Button type="submit" className="w-full">
            Save transaction
          </Button>
        </form>
      </Card>
    </div>
  );
}
