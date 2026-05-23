'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    role: 'admin' as const,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Card>
      <h1 className="mb-1 text-2xl font-bold text-primary-blue">Create account</h1>
      <p className="mb-6 text-sm text-text-secondary">Register your SME on StockPilot</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(['name', 'businessName', 'email'] as const).map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">
              {field === 'businessName' ? 'Business name' : field}
            </label>
            <Input
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              type={field === 'email' ? 'email' : 'text'}
              required
            />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-danger-red">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent-blue hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
