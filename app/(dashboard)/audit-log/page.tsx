import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AuditLog } from '@/lib/models/AuditLog';
import { User } from '@/lib/models/User';
import { Card } from '@/components/ui/Card';

export default async function AuditLogPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== 'admin') redirect('/dashboard');

  await dbConnect();
  const userIds = await User.find({ businessId: session.businessId }).distinct('_id');
  const logs = await AuditLog.find({ user: { $in: userIds } })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Entity</th>
              <th className="px-4 py-3 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id.toString()} className="border-t border-border">
                <td className="px-4 py-3">{(log.user as { name?: string })?.name ?? '—'}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.entity}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
