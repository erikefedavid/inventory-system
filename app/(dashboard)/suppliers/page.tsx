'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string; phone: string; email?: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  async function load() {
    const res = await fetch('/api/v1/suppliers', { credentials: 'include' });
    const data = await res.json();
    setSuppliers(data.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/v1/suppliers', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: '', phone: '', email: '' });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add supplier'}</Button>
      </div>
      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Button type="submit" className="sm:col-span-3">
              Save
            </Button>
          </form>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {suppliers.map((s) => (
          <Card key={s._id}>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-text-secondary">{s.phone}</p>
            {s.email && <p className="text-sm text-text-secondary">{s.email}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
