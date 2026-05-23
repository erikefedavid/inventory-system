'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'clerk'] },
  { href: '/audit-log', label: 'Audit Log', icon: Shield, roles: ['admin'] },
];

export function Sidebar({ role, alertCount = 0 }: { role: UserRole; alertCount?: number }) {
  const pathname = usePathname();
  const visible = links.filter((l) => l.roles.includes(role));

  return (
    <aside className="glass-nav flex h-full w-64 flex-col text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <h1 className="text-xl font-bold tracking-tight">StockPilot</h1>
        <p className="text-xs text-white/60">Inventory Management</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
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
  );
}
