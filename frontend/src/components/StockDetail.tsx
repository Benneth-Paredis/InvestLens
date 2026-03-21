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

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: ticker ? '#111' : '#ccc' }}>
        {ticker ?? 'Select a holding'}
      </h2>

      {/* Interval toggles */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {INTERVALS.map((i) => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: interval === i ? '#1a1a2e' : '#fff',
              color: interval === i ? '#fff' : '#111',
              fontWeight: interval === i ? 600 : 400,
            }}
          >
            {i.charAt(0).toUpperCase() + i.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart — renders an empty axes when no ticker is selected */}
      <div style={{ width: '100%', height: 260, marginBottom: '24px' }}>
        {!ticker ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : loadingPrices ? (
          <p style={{ color: '#999', fontSize: '14px' }}>Loading prices...</p>
        ) : priceHistory && priceHistory.prices.length > 0 ? (() => {
          const prices = priceHistory.prices;
          // Colour the line green for a net gain, red for a net loss over the period.
          const isPositive = prices[prices.length - 1].close >= prices[0].close;
          const lineColor = isPositive ? '#16a34a' : '#dc2626';
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prices}>
                <CartesianGrid strokeDashboard="3 3" stroke="#eee" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d) => d.slice(0, 7)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Close']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          );
        })() : (
          <p style={{ color: '#999', fontSize: '14px' }}>No price data available.</p>
        )}
      </div>

      {/* Stock stats */}
      {loadingStats ? (
        <p style={{ color: '#999', fontSize: '14px' }}>Loading stats...</p>
      ) : stats ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            { label: 'Sector', value: stats.sector },
            { label: 'Market Cap', value: stats.marketCap },
            { label: 'P/E Ratio', value: stats.peRatio },
            { label: '52W High', value: stats.weekHigh52 },
            { label: '52W Low', value: stats.weekLow52 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
