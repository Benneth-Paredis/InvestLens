// Displays the top holdings ranked by portfolio weight (% of total invested).

import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
}

export default function TopHoldings({ holdings }: Props) {
  if (holdings.length === 0) return null;

  const total = holdings.reduce((sum, h) => sum + h.amountInvested, 0);

  const sorted = [...holdings]
    .sort((a, b) => b.amountInvested - a.amountInvested)
    .slice(0, 5);

  return (
    <div style={{
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a' }}>
        Top Holdings
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((h) => {
          const pct = (h.amountInvested / total) * 100;
          return (
            <div key={h.ticker}>
              {/* Ticker + amount row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{h.ticker}</span>
                <span style={{ fontSize: '13px', color: '#555' }}>
                  ${h.amountInvested.toLocaleString()} &nbsp;
                  <span style={{ color: '#999', fontWeight: 400 }}>{pct.toFixed(1)}%</span>
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#1a1a1a', borderRadius: '2px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
