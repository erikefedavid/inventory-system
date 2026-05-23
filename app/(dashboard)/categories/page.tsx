'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ _id: string; name: string; description?: string }[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/v1/categories', { credentials: 'include' });
    const data = await res.json();
    setCategories(data.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/v1/categories', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setName('');
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <Card>
        <form onSubmit={add} className="flex gap-3">
          <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit">Add</Button>
        </form>
        {error && <p className="mt-2 text-sm text-danger-red">{error}</p>}
      </Card>
      <ul className="divide-y rounded-xl border border-border bg-white">
        {categories.map((c) => (
          <li key={c._id} className="flex justify-between px-4 py-3 text-sm">
            <span className="font-medium">{c.name}</span>
            <span className="text-text-secondary">{c.description || '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
