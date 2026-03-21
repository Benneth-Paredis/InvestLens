import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Holding } from '../types';
import PortfolioInput from '../components/PortfolioInput';
import PortfolioList from '../components/PortfolioList';
import StockDetail from '../components/StockDetail';

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const navigate = useNavigate();

  function handleRemove(ticker: string) {
    setHoldings((prev) => prev.filter((h) => h.ticker !== ticker));
    if (selectedTicker === ticker) setSelectedTicker(null);
  }

  function handleAdd(holding: Holding) {
    setHoldings((prev) => {
      const exists = prev.find((h) => h.ticker === holding.ticker);
      if (exists) return prev;
      return [...prev, holding];
    });
  }

  async function handleAnalyse() {
    if (holdings.length === 0) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
      });
      const data = await res.json();
      localStorage.setItem('holdings', JSON.stringify(holdings));
      localStorage.setItem('analysis', JSON.stringify(data.analysis));
      navigate('/analysis');
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>InvestLens</h1>

      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* Left column */}
        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PortfolioInput holdings={holdings} onAdd={handleAdd} />
          <PortfolioList
            holdings={holdings}
            selectedTicker={selectedTicker}
            onSelect={setSelectedTicker}
            onRemove={handleRemove}
          />
          {holdings.length > 0 && (
            <button
              onClick={handleAnalyse}
              disabled={analysisLoading}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: analysisLoading ? 'not-allowed' : 'pointer',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                opacity: analysisLoading ? 0.6 : 1,
              }}
            >
              {analysisLoading ? 'Analysing...' : 'Analyse Portfolio'}
            </button>
          )}
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedTicker ? (
            <StockDetail ticker={selectedTicker} />
          ) : (
            <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
              Select a holding to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
