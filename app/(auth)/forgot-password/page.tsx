'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Request failed');
      return;
    }
    setMessage(data.data?.message || 'Check your email for the reset code.');
    setStep('reset');
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Reset failed');
      return;
    }
    setMessage('Password updated. You can sign in now.');
  }

  return (
    <Card>
      <h1 className="mb-6 text-2xl font-bold text-primary-blue">Reset password</h1>
      {step === 'request' ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          {error && <p className="text-sm text-danger-red">{error}</p>}
          <Button type="submit" className="w-full">
            Send reset code
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" required />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            minLength={8}
            required
          />
          {error && <p className="text-sm text-danger-red">{error}</p>}
          {message && <p className="text-sm text-success-green">{message}</p>}
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-accent-blue hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
