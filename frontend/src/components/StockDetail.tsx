// Shows a price history chart and key stats for a selected stock ticker.

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
import type { StockData, PriceHistory } from '../types';

interface Props {
  ticker: string | null;
}

const INTERVALS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
type Interval = (typeof INTERVALS)[number];

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '20px',
};

// Fetches and renders a price chart and fundamental stats for the given ticker.
export default function StockDetail({ ticker }: Props) {
  const [stats, setStats] = useState<StockData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [interval, setInterval] = useState<Interval>('monthly');
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Re-fetch fundamental stats whenever the selected ticker changes.
  useEffect(() => {
    if (!ticker) { setStats(null); return; }
    setLoadingStats(true);
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // amountInvested is irrelevant here; send 0 to satisfy the API contract.
      body: JSON.stringify({ holdings: [{ ticker, amountInvested: 0 }] }),
    })
      .then((r) => r.json())
      .then((data) => setStats(data.portfolio[0]))
      .finally(() => setLoadingStats(false));
  }, [ticker]);

  // Re-fetch price history whenever the ticker or selected interval changes.
  useEffect(() => {
    if (!ticker) { setPriceHistory(null); return; }
    setLoadingPrices(true);
    fetch(`/api/prices/${ticker}/${interval}`)
      .then((r) => r.json())
      .then((data) => setPriceHistory(data))
      .finally(() => setLoadingPrices(false));
  }, [ticker, interval]);

  // Empty state shown when no ticker is selected.
  if (!ticker) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', padding: '40px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>Select a stock to explore</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#999', maxWidth: '260px', lineHeight: 1.6 }}>
          Click any holding on the left to see its price history and key stats
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Card 1: ticker name + interval toggles */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
          {ticker}
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

      {/* Card 2: line chart */}
      <div style={{ ...card, height: '260px' }}>
        {loadingPrices ? (
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>Loading prices...</p>
        ) : priceHistory && priceHistory.prices.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory.prices}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) =>
                  interval === 'daily'
                    ? d.slice(11, 16)           // "HH:MM"
                    : interval === 'weekly'
                    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : d.slice(0, 7)             // "YYYY-MM"
                }
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Close']}
                labelFormatter={(label) =>
                  interval === 'daily'
                    ? new Date(label).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : label
                }
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#1a1a2e"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No price data available.</p>
        )}
      </div>

      {/* Card 3: 2x3 stats grid */}
      <div style={card}>
        {loadingStats ? (
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>Loading stats...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 24px' }}>
            {[
              { label: 'Sector', value: stats?.sector },
              { label: 'Market Cap', value: stats?.marketCap },
              { label: 'Current Price', value: stats?.currentPrice },
              { label: 'P/E Ratio', value: stats?.peRatio },
              { label: '52W High', value: stats?.weekHigh52 },
              { label: '52W Low', value: stats?.weekLow52 },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                  {value ?? '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
