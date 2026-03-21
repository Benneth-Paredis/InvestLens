import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
}

interface SectorSlice {
  name: string;
  value: number;
}

const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#2c7873', '#6fb98f', '#f5a623'];

export default function SectorPieChart({ holdings }: Props) {
  const [slices, setSlices] = useState<SectorSlice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (holdings.length === 0) return;
    setLoading(true);
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdings }),
    })
      .then((r) => r.json())
      .then((data) => {
        const totals: Record<string, number> = {};
        for (const stock of data.portfolio) {
          const sector = stock.sector ?? 'Unknown';
          totals[sector] = (totals[sector] ?? 0) + stock.amountInvested;
        }
        setSlices(Object.entries(totals).map(([name, value]) => ({ name, value })));
      })
      .finally(() => setLoading(false));
  }, [holdings]);

  if (loading) return <p style={{ color: '#999', fontSize: '14px' }}>Loading sectors...</p>;
  if (slices.length === 0) return null;

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {slices.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              'Invested',
            ]}
          />
          <Legend
            formatter={(value, entry) => {
              const pct = (((entry.payload as unknown as SectorSlice).value / total) * 100).toFixed(1);
              return `${value} — ${pct}%`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
