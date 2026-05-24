import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongoose';
import { getSession } from '@/lib/auth/session';
import { User } from '@/lib/models/User';
import { getLowStockProducts } from '@/lib/services/product.service';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  const user = await User.findById(session.userId).select('name role isActive');
  if (!user || !user.isActive) redirect('/login');

  let alertCount = 0;
  try {
    const low = await getLowStockProducts(session.businessId);
    alertCount = low.length;
  } catch {
    // MongoDB may be unavailable during dev
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.role} alertCount={alertCount} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav name={user.name} role={user.role} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 pt-16 lg:p-6 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
