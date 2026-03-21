import { useState } from 'react';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
  onAdd: (holding: Holding) => void;
}

export default function PortfolioInput({ onAdd }: Props) {
  const [ticker, setTicker] = useState('');
  const [amountInvested, setAmountInvested] = useState('');

  function handleAdd() {
    if (!ticker || !amountInvested) return;
    onAdd({ ticker, amountInvested: parseFloat(amountInvested) });
    setTicker('');
    setAmountInvested('');
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Ticker"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
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
        style={{
          padding: '8px 16px',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  );
}
