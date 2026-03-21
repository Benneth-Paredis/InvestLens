// Form component for adding a new holding (ticker + amount) to the portfolio.

import { useState } from 'react';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
  onAdd: (holding: Holding) => void;
}

// Renders a ticker input, amount input, and an add button; validates the ticker before calling onAdd.
export default function PortfolioInput({ onAdd }: Props) {
  const [ticker, setTicker] = useState('');
  const [amountInvested, setAmountInvested] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  async function handleAdd() {
    if (!ticker || !amountInvested) return;
    setError(null);
    setValidating(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: [{ ticker, amountInvested: 0 }] }),
      });
      if (!res.ok) {
        setError(`"${ticker}" not found.`);
        return;
      }
      onAdd({ ticker, amountInvested: parseFloat(amountInvested) });
      // Clear fields after a successful add.
      setTicker('');
      setAmountInvested('');
    } catch {
      setError('Could not validate ticker. Check your connection.');
    } finally {
      setValidating(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => { setTicker(e.target.value.toUpperCase()); setError(null); }}
          style={{ padding: '8px', width: '100px', fontSize: '14px' }}
        />
        <input
          type="number"
          placeholder="Amount ($)"
          value={amountInvested}
          onChange={(e) => setAmountInvested(e.target.value)}
          style={{ padding: '8px', width: '130px', fontSize: '14px' }}
        />
        <button
          onClick={handleAdd}
          disabled={validating}
          style={{
            padding: '8px 16px',
            fontSize: '18px',
            cursor: validating ? 'not-allowed' : 'pointer',
            lineHeight: 1,
            opacity: validating ? 0.6 : 1,
          }}
        >
          {validating ? '...' : '+'}
        </button>
      </div>
      {error && <p style={{ margin: 0, fontSize: '13px', color: '#dc2626' }}>{error}</p>}
    </div>
  );
}
