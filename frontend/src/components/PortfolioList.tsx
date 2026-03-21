import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
  selectedTicker: string | null;
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

export default function PortfolioList({ holdings, selectedTicker, onSelect, onRemove }: Props) {
  if (holdings.length === 0) {
    return <p style={{ color: '#999', fontSize: '14px' }}>No holdings added yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {holdings.map((holding) => {
        const isSelected = holding.ticker === selectedTicker;
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
              fontWeight: isSelected ? 600 : 400,
              transition: 'background-color 0.15s',
            }}
          >
            <span style={{ fontSize: '15px', letterSpacing: '0.5px' }}>{holding.ticker}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', opacity: 0.75 }}>
                ${holding.amountInvested.toLocaleString()}
              </span>
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
