// Displays all current holdings as a selectable, removable list with gain/loss indicators.

import type { Holding, StockData } from '../types';

interface Props {
  holdings: Holding[];
  stockDataMap: Record<string, StockData>;
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

// Calculates current value and gain/loss % using actual shares and current price.
function calcMetrics(holding: Holding, data: StockData): { worth: number | null; gainLoss: number | null } {
  const currentPrice = parseFloat(data.currentPrice.replace('$', ''));
  if (!currentPrice || isNaN(currentPrice)) return { worth: null, gainLoss: null };
  const worth = holding.shares * currentPrice;
  const gainLoss = ((worth - holding.amountInvested) / holding.amountInvested) * 100;
  return { worth, gainLoss };
}

// Renders each holding as a row with stacked data points, gain/loss badge, and a remove button.
export default function PortfolioList({ holdings, stockDataMap, selectedTicker, onSelect, onRemove }: Props) {
  if (holdings.length === 0) {
    return <p style={{ color: '#999', fontSize: '14px' }}>No holdings added yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {holdings.map((holding) => {
        const isSelected = holding.ticker === selectedTicker;
        const data = stockDataMap[holding.ticker];
        const { worth, gainLoss } = data ? calcMetrics(holding, data) : { worth: null, gainLoss: null };

        return (
          <div
            key={holding.ticker}
            onClick={() => onSelect(holding.ticker)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: isSelected ? '#1a1a2e' : '#f5f5f5',
              color: isSelected ? '#fff' : '#111',
              transition: 'background-color 0.15s',
            }}
          >
            {/* Ticker name */}
            <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>
              {holding.ticker}
            </span>

            {/* Right side: data column + badge + remove */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

              {/* Stacked data points */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: isSelected ? '#aaa' : '#999' }}>
                  Invested: ${holding.amountInvested.toLocaleString()}
                </span>
                <span style={{ fontSize: '11px', color: isSelected ? '#aaa' : '#999' }}>
                  Shares: {holding.shares}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#fff' : '#1a1a1a' }}>
                  Worth: {worth !== null ? `$${worth.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                </span>
              </div>

              {/* Gain/loss badge with disclaimer tooltip */}
              {gainLoss !== null && (
                <span
                  title="Estimated based on shares × current price vs. amount invested"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    minWidth: '60px',
                    textAlign: 'right',
                    color: gainLoss >= 0
                      ? (isSelected ? '#86efac' : '#16a34a')
                      : (isSelected ? '#fca5a5' : '#dc2626'),
                  }}
                >
                  {gainLoss >= 0 ? '▲' : '▼'} {Math.abs(gainLoss).toFixed(1)}%
                </span>
              )}

              {/* stopPropagation prevents the row click (select) from firing when removing. */}
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(holding.ticker); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '0 2px',
                  color: isSelected ? '#fff' : '#999',
                  opacity: 0.7,
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
