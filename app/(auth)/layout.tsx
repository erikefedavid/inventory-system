import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ShieldCheck, BarChart3, Layers, Database } from 'lucide-react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Left pane: Showcase & Branding */}
      <div className="relative flex flex-col justify-between bg-gradient-to-br from-primary-blue via-slate-900 to-primary-blue px-8 py-12 text-white lg:w-[55%] xl:w-[60%] lg:px-16 lg:py-16 overflow-hidden">
        {/* Floating background decorative blobs */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-accent-blue/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-12 right-12 w-96 h-96 bg-success-green/10 rounded-full blur-[100px]" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10">
            <span className="h-2 w-2 rounded-full bg-success-green glow-success" />
            StockPilot Platform v1.0.0
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight lg:text-4xl">StockPilot</h1>
          <p className="text-sm text-white/60">Inventory & Stock Management System for SMEs</p>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 my-12 space-y-6 max-w-lg">
          <h2 className="text-2xl font-bold lg:text-3xl leading-snug">
            Pilot Your Stock with <span className="text-accent-blue font-extrabold">Real-Time Precision</span>
          </h2>
          <p className="text-sm text-white/75 leading-relaxed">
            Replace manual spreadsheets and error-prone tracking with an automated procurement ledger built specifically for Nigerian SMEs.
          </p>

          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div className="glass-card rounded-xl p-4 flex gap-3 items-start border border-white/10">
              <div className="rounded-lg bg-accent-blue/20 p-2 text-accent-blue">
                <Layers size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Live Valuation</h4>
                <p className="text-xs text-white/60 mt-0.5">Asset cost & markup updates</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex gap-3 items-start border border-white/10">
              <div className="rounded-lg bg-success-green/20 p-2 text-success-green animate-pulse">
                <BarChart3 size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Stepper PO Flow</h4>
                <p className="text-xs text-white/60 mt-0.5">Auto stock-in on receive</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex gap-3 items-start border border-white/10">
              <div className="rounded-lg bg-warning-orange/20 p-2 text-warning-orange">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Immutable Audits</h4>
                <p className="text-xs text-white/60 mt-0.5">Read-only ledger logs</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex gap-3 items-start border border-white/10">
              <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                <Database size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">CSV Bulk Ingestion</h4>
                <p className="text-xs text-white/60 mt-0.5">Loads directories instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Block */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">LCU FINAL YEAR PROJECT RESEARCH</p>
          <p className="text-xs text-white/80 font-medium mt-1">Author: Opaogun Gabriel Modupe (Matric No: LCU/UG/22/22307)</p>
          <p className="text-[11px] text-white/60">Supervisor: Mr. Likinyo A.P · Lead City University, Ibadan</p>
        </div>
      </div>

      {/* Right pane: Auth Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:w-[45%] xl:w-[40%] bg-slate-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
