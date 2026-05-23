'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TopNav({ name, role }: { name: string; role: string }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <User size={16} />
          <span className="font-medium text-text-primary">{name}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">{role}</span>
        </div>
        <Button variant="ghost" onClick={logout} className="gap-2">
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
}
