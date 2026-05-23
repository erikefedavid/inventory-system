import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'text-accent-blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>}
        </div>
        <div className={`rounded-lg bg-slate-100 p-2 ${accent}`}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}
