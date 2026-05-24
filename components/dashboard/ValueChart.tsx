'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export function ValueChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-text-secondary">No valuation data yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₦${(v ?? 0).toLocaleString()}`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
