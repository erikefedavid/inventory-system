import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { listTransactions } from '@/lib/services/transaction.service';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default async function TransactionsPage() {
  const session = await getSession();
  if (!session) return null;
  await dbConnect();
  const transactions = await listTransactions({ businessId: session.businessId });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/transactions/new">
          <Button>Record stock</Button>
        </Link>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Stock after</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id.toString()} className="border-t border-border">
                <td className="px-4 py-3">{(tx.product as { name?: string })?.name ?? '—'}</td>
                <td className="px-4 py-3 capitalize">{tx.type.replace('_', ' ')}</td>
                <td className="px-4 py-3">{tx.quantity}</td>
                <td className="px-4 py-3">{tx.newStock}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!transactions.length && (
          <p className="p-8 text-center text-text-secondary">No transactions recorded</p>
        )}
      </Card>
    </div>
  );
}
