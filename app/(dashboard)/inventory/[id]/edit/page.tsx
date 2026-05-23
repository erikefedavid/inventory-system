'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
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
    if (!id) return;
    Promise.all([
      fetch('/api/v1/categories', { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/v1/products/${id}`, { credentials: 'include' }).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData.data || []);
      const p = prodData.data?.product || prodData.data;
      if (p) {
        setForm({
          name: p.name || '',
          categoryId: p.category?._id || p.categoryId || '',
          unit: p.unit || 'pcs',
          costPrice: p.costPrice || 0,
          sellingPrice: p.sellingPrice || 0,
          reorderPoint: p.reorderPoint ?? 10,
          description: p.description || '',
        });
      }
      setLoading(false);
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/v1/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to update product');
      return;
    }
    window.location.href = `/inventory/${id}`;
  }

  if (loading) return <p className="p-6 text-text-secondary">Loading...</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Edit product</h1>
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
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <Input placeholder="Unit (pcs, kg...)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Cost price" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })} required />
            <Input type="number" placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} required />
          </div>
          <Input type="number" placeholder="Reorder point" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: +e.target.value })} />
          {error && <p className="text-sm text-danger-red">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Save changes</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
