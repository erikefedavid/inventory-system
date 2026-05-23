import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  ShieldCheck,
  FileText,
  UploadCloud,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default async function LandingPage() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-text-primary flex flex-col font-sans selection:bg-accent-blue/10 selection:text-accent-blue overflow-x-hidden">
      {/* Dynamic Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-blue p-2.5 text-white shadow-md">
            <Sparkles size={20} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">StockPilot</h1>
            <p className="text-[10px] text-text-secondary leading-none uppercase font-bold tracking-widest mt-0.5">SME Management</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
          <a href="#features" className="hover:text-accent-blue transition">Capabilities</a>
          <a href="#academic" className="hover:text-accent-blue transition">Thesis Research</a>
          <a href="#tech" className="hover:text-accent-blue transition">Architecture</a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="flex items-center gap-1.5 text-xs bg-accent-blue text-white shadow-lg shadow-blue-500/20">
                Go to Dashboard
                <ChevronRight size={14} />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-xs bg-accent-blue text-white shadow-lg shadow-blue-500/20">
                  Register Business
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 bg-gradient-to-b from-white via-slate-50 to-slate-100 overflow-hidden">
        {/* Floating gradient decorations */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-success-green/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-text-secondary border border-border">
            <span className="h-2 w-2 rounded-full bg-accent-blue glow-warning animate-pulse" />
            Designed for SME Operations in Nigeria & Emerging Markets
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-text-primary leading-tight">
            Automate Your Inventory.<br />
            <span className="bg-gradient-to-r from-primary-blue to-accent-blue bg-clip-text text-transparent">
              Secure Your Profit Margins.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Replace manual ledgers and error-prone sheets with an automated procurement engine featuring real-time category valuations, multi-item purchase orders, and read-only audit journals.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="h-12 px-8 text-sm bg-primary-blue text-white shadow-lg shadow-slate-900/10">
                  Access Platform Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button className="h-12 px-8 text-sm bg-accent-blue text-white shadow-lg shadow-blue-500/25">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="h-12 px-8 text-sm border border-border bg-white text-text-primary">
                    Login to Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="px-6 py-20 lg:px-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-text-primary">Engineered Capabilities</h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto">
              A comprehensive toolset developed to eliminate stock errors, avert stockouts, and track business growth.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-premium space-y-4">
              <div className="rounded-xl bg-accent-blue/10 p-3 text-accent-blue w-fit">
                <Layers size={20} />
              </div>
              <h3 className="font-bold text-lg">Live Asset Valuation</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Aggregates total cost value versus projected selling retail value automatically, mapping category-level margins and markup percentages.
              </p>
            </Card>

            <Card className="hover-premium space-y-4">
              <div className="rounded-xl bg-success-green/10 p-3 text-success-green w-fit">
                <ArrowRightLeft size={20} />
              </div>
              <h3 className="font-bold text-lg">Purchase Order Stepper</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Raise orders to suppliers with multiple items and expected dates. Changing status to received automatically triggers inventory stock-ins.
              </p>
            </Card>

            <Card className="hover-premium space-y-4">
              <div className="rounded-xl bg-warning-orange/10 p-3 text-warning-orange w-fit">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-lg">Low Stock Alarm Badges</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Flags products falling below reorder limits with pulse glow notification alerts, warning admins to procure before stockouts.
              </p>
            </Card>

            <Card className="hover-premium space-y-4">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-600 w-fit">
                <UploadCloud size={20} />
              </div>
              <h3 className="font-bold text-lg">CSV Bulk Importer</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Upload massive product files. Parses CSV formatting, pre-validates pricing models, and automatically creates categories on-the-fly.
              </p>
            </Card>

            <Card className="hover-premium space-y-4">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700 w-fit">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-lg">Immutable Audit Trails</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Append-only logging system tracking every stock action, adjustment, and status change with before/after snapshots for full accountability.
              </p>
            </Card>

            <Card className="hover-premium space-y-4">
              <div className="rounded-xl bg-pink-500/10 p-3 text-pink-600 w-fit">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-lg">PDF Procurement Invoices</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Instantly prints high-end corporate purchase order invoices and inventory value summaries directly client-side utilizing custom layout scripts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Academic Research Section */}
      <section id="academic" className="px-6 py-20 lg:px-16 bg-slate-50/50">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-primary-blue to-slate-900 text-white p-8 lg:p-12 relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-accent-blue uppercase tracking-widest">
              <BookOpen size={16} />
              Lead City University Final Year Project
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
              Academic Thesis & Evaluation Specifications
            </h2>
            
            <p className="text-sm text-white/75 leading-relaxed">
              This inventory system has been purpose-built as an empirical design prototype to evaluate how automated, real-time transaction ledgers affect carrying costs and data accuracy within Nigerian micro-enterprises.
            </p>

            <div className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 text-xs leading-relaxed text-white/90">
              <div className="space-y-1.5">
                <p className="text-white/40 uppercase tracking-widest font-bold text-[9px]">RESEARCH AUTHOR</p>
                <p className="font-bold text-sm text-white">Opaogun Gabriel Modupe</p>
                <p className="text-white/70">Matriculation No: LCU/UG/22/22307</p>
                <p className="text-white/70">Department of Computer Science</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-white/40 uppercase tracking-widest font-bold text-[9px]">SUPERVISORY MENTOR</p>
                <p className="font-bold text-sm text-white">Mr. Likinyo A.P</p>
                <p className="text-white/70">Faculty of Applied Sciences</p>
                <p className="text-white/70">Lead City University, Ibadan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-8 lg:px-16 text-center text-xs text-text-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 StockPilot. All rights reserved.</p>
          <p className="text-[10px] text-text-secondary/80">
            CONFIDENTIAL — FOR ACADEMIC EVALUATION PURPOSES ONLY · LEAD CITY UNIVERSITY
          </p>
        </div>
      </footer>
    </div>
  );
}
