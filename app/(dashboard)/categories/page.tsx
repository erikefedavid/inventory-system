'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ _id: string; name: string; description?: string }[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/v1/categories', { credentials: 'include' });
    const data = await res.json();
    setCategories(data.data || []);
  }

  useEffect(() => { load(); }, []);

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
    if (!res.ok) { setError(data.error || 'Failed'); return; }
    setName('');
    load();
  }

  async function update(id: string) {
    await fetch(`/api/v1/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    setEditId('');
    load();
  }

  async function archive(id: string) {
    if (!confirm('Archive this category?')) return;
    await fetch(`/api/v1/categories/${id}`, { method: 'DELETE', credentials: 'include' });
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
          <li key={c._id} className="flex items-center justify-between px-4 py-3 text-sm">
            {editId === c._id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={() => update(c._id)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId('')}>Cancel</Button>
              </div>
            ) : (
              <>
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">{c.description || '—'}</span>
                  <button
                    className="text-xs text-accent-blue hover:underline"
                    onClick={() => { setEditId(c._id); setEditName(c.name); }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-danger-red hover:underline"
                    onClick={() => archive(c._id)}
                  >
                    Archive
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
