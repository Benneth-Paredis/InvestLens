// Form component for adding a new holding (ticker + shares + amount) to the portfolio.

import { useState } from 'react';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
  onAdd: (holding: Holding) => void;
}

const inputStyle: React.CSSProperties = {
  padding: '0 10px',
  fontSize: '14px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '6px',
  height: '40px',
  width: '100%',
};

// Renders ticker, shares, and amount inputs with validation before calling onAdd.
export default function PortfolioInput({ holdings, onAdd }: Props) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [amountInvested, setAmountInvested] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [hoveredAddButton, setHoveredAddButton] = useState(false)

  async function handleAdd() {
    if (!ticker || !shares || !amountInvested) return;
    const upper = ticker.toUpperCase();
    if (holdings.some((h) => h.ticker === upper)) {
      setError(`${upper} is already in your portfolio.`);
      return;
    }
    setError(null);
    setValidating(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: [{ ticker: upper, shares: 0, amountInvested: 0 }] }),
      });
      if (!res.ok) {
        setError(`"${upper}" not found.`);
        return;
      }
      onAdd({ ticker: upper, shares: parseFloat(shares), amountInvested: parseFloat(amountInvested) });
      // Clear fields after a successful add.
      setTicker('');
      setShares('');
      setAmountInvested('');
    } catch {
      setError('Could not validate ticker. Check your connection.');
    } finally {
      setValidating(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Row 1: ticker + shares */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => { setTicker(e.target.value.toUpperCase()); setError(null); }}
          style={{ ...inputStyle, width: '110px', flex: 'none' }}
        />
        <input
          type="number"
          placeholder="Shares"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
      {/* Row 2: amount invested + add button */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="number"
          placeholder="Amount invested ($)"
          value={amountInvested}
          onChange={(e) => setAmountInvested(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onMouseEnter={() => {setHoveredAddButton(true)}}
          onMouseLeave={() => {setHoveredAddButton(false)}}
          onClick={handleAdd}
          disabled={validating}
          style={{
            height: '40px',
            padding: '0 18px',
            fontSize: '20px',
            fontWeight: 700,
            cursor: validating ? 'not-allowed' : 'pointer',
            lineHeight: 1,
            opacity: validating ? 0.6 : 1,
            backgroundColor: hoveredAddButton ? '#20b452' : '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            flexShrink: 0,
            
          }}
        >
          {validating ? '…' : '+'}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', height: '20px', lineHeight: '20px' }}>
        {error ?? ''}
      </p>
    </div>
  );
}
