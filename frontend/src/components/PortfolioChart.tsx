// Shows total portfolio value over time as a line chart with interval toggles.

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Holding } from '../types';

interface PortfolioValuePoint {
  date: string;
  value: number;
}

interface Props {
  holdings: Holding[];
}

const INTERVALS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
type Interval = (typeof INTERVALS)[number];

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '20px',
};

export default function PortfolioChart({ holdings }: Props) {
  const [history, setHistory] = useState<PortfolioValuePoint[]>([]);
  const [interval, setInterval] = useState<Interval>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (holdings.length === 0) { setHistory([]); return; }
    setLoading(true);
    fetch('/api/portfolio-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdings, interval }),
    })
      .then((r) => r.json())
      .then((data) => setHistory(data.history))
      .finally(() => setLoading(false));
  }, [holdings, interval]);

  const lineColor =
    history.length >= 2
      ? history[history.length - 1].value >= history[0].value
        ? '#16a34a'
        : '#dc2626'
      : '#1a1a2e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header + interval toggles */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
          Portfolio Value
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {INTERVALS.map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: '1px solid #e5e5e5',
                backgroundColor: interval === i ? '#1a1a2e' : '#fff',
                color: interval === i ? '#fff' : '#111',
                fontWeight: interval === i ? 600 : 400,
              }}
            >
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ ...card, height: '260px' }}>
        {loading ? (
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>Loading chart...</p>
        ) : history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) =>
                  interval === 'daily'
                    ? d.slice(11, 16)
                    : interval === 'weekly'
                    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : d.slice(0, 7)
                }
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `$${(v / 1000000).toFixed(1)}M`
                    : v >= 1000
                    ? `$${(v / 1000).toFixed(1)}k`
                    : `$${v}`
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  'Portfolio',
                ]}
                labelFormatter={(label) =>
                  interval === 'daily'
                    ? new Date(label).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : label
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No data available.</p>
        )}
      </div>

    </div>
  );
}
