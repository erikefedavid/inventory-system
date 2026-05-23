'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Shield,
  Tags,
  Users,
  X,
  Menu,
} from 'lucide-react';
import type { UserRole } from '@/lib/models/User';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'clerk'] },
  { href: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'manager', 'clerk'] },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight, roles: ['admin', 'manager', 'clerk'] },
  { href: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager', 'clerk'] },
  { href: '/purchase-orders', label: 'Purchase Orders', icon: FileText, roles: ['admin', 'manager'] },
  { href: '/alerts', label: 'Alerts', icon: Bell, roles: ['admin', 'manager', 'clerk'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { href: '/categories', label: 'Categories', icon: Tags, roles: ['admin', 'manager'] },
  { href: '/settings/users', label: 'Users', icon: Users, roles: ['admin'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'clerk'] },
  { href: '/audit-log', label: 'Audit Log', icon: Shield, roles: ['admin'] },
];

export function Sidebar({ role, alertCount = 0 }: { role: UserRole; alertCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = links.filter((l) => l.roles.includes(role));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-lg bg-primary-blue p-2 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-primary-blue text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">StockPilot</h1>
            <p className="text-xs text-white/60">Inventory Management</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {visible.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {href === '/alerts' && alertCount > 0 && (
                  <span className="rounded-full bg-danger-red px-2 py-0.5 text-xs font-bold">
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
