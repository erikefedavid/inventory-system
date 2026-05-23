'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; businessName: string } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setUser(d.data));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const res = await fetch('/api/v1/auth/me', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, phone: user.phone }),
    });
    if (res.ok) setMessage('Profile updated');
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary">Business</label>
            <p className="font-medium">{user.businessName}</p>
          </div>
          <Input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <Input value={user.email} disabled />
          <Input
            placeholder="Phone"
            value={user.phone || ''}
            onChange={(e) => setUser({ ...user, phone: e.target.value })}
          />
          {message && <p className="text-sm text-success-green">{message}</p>}
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
    </div>
  );
}
