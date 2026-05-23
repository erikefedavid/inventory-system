'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string; phone: string; email?: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', contactPerson: '', address: '' });

  async function load() {
    const url = search ? `/api/v1/suppliers?search=${encodeURIComponent(search)}` : '/api/v1/suppliers';
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    setSuppliers(data.data || []);
  }

  useEffect(() => {
    load();
  }, [search]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/v1/suppliers', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: '', phone: '', email: '', contactPerson: '', address: '' });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add supplier'}</Button>
      </div>

      <Input
        placeholder="Search suppliers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Contact person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="sm:col-span-2" />
            <Button type="submit" className="sm:col-span-2">Save</Button>
          </form>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {suppliers.map((s) => (
          <Link key={s._id} href={`/suppliers/${s._id}`}>
            <Card className="hover:border-accent-blue/30 cursor-pointer transition">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-text-secondary">{s.phone}</p>
              {s.email && <p className="text-sm text-text-secondary">{s.email}</p>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
