'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    unit: 'pcs',
    costPrice: 0,
    sellingPrice: 0,
    reorderPoint: 10,
    description: '',
  });

  useEffect(() => {
    fetch('/api/v1/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/v1/products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create product');
      return;
    }
    router.push('/inventory');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Add product</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-warning-orange">
              Create a category first under Categories.
            </p>
          )}
          <Input placeholder="Unit (pcs, kg...)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Cost price" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })} required />
            <Input type="number" placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} required />
          </div>
          <Input type="number" placeholder="Reorder point" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: +e.target.value })} />
          {error && <p className="text-sm text-danger-red">{error}</p>}
          <Button type="submit" className="w-full">
            Save product
          </Button>
        </form>
      </Card>
    </div>
  );
}
