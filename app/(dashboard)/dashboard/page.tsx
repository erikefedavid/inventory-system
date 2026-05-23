import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { getDashboardStats, getMovementChartData } from '@/lib/services/dashboard.service';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MovementChart } from '@/components/dashboard/MovementChart';
import { Card } from '@/components/ui/Card';
import { Package, DollarSign, AlertTriangle, XCircle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  await dbConnect();

  let stats;
  let chartData: { name: string; movement: number }[] = [];
  try {
    stats = await getDashboardStats(session.businessId);
    if (session.role !== 'clerk') {
      chartData = await getMovementChartData(session.businessId);
    }
  } catch {
    return (
      <div className="rounded-lg border border-warning-orange/30 bg-orange-50 p-6 text-sm">
        Cannot load dashboard. Ensure MongoDB is running and <code>.env.local</code> is configured.
      </div>
    );
  }

  const formatNaira = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary">Real-time overview of your inventory</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Products" value={stats.totalProducts} icon={Package} />
        <StatsCard
          title="Stock Value"
          value={formatNaira(stats.totalStockValue)}
          icon={DollarSign}
          accent="text-success-green"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          accent="text-warning-orange"
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={XCircle}
          accent="text-danger-red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Top movement (30 days)</h2>
          <MovementChart data={chartData} />
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Today</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-text-secondary">Stock-ins</span>
              <span className="font-medium">{stats.todayStockIns}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-text-secondary">Stock-outs</span>
              <span className="font-medium">{stats.todayStockOuts}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-text-secondary">Total transactions</span>
              <span className="font-medium">{stats.todayTransactions}</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Recent transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="pb-2 pr-4">Product</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Qty</th>
                <th className="pb-2">When</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((tx) => (
                <tr key={String(tx._id)} className="border-b border-border/50">
                  <td className="py-2 pr-4">{(tx.product as { name?: string })?.name ?? '—'}</td>
                  <td className="py-2 pr-4 capitalize">{tx.type.replace('_', ' ')}</td>
                  <td className="py-2 pr-4">{tx.quantity}</td>
                  <td className="py-2 text-text-secondary">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats.recentTransactions.length && (
            <p className="py-6 text-center text-text-secondary">No transactions yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
