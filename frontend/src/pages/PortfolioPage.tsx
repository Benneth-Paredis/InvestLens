// Main portfolio-building page where users add holdings, view stock details, and trigger analysis.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Holding } from '../types';
import PortfolioInput from '../components/PortfolioInput';
import PortfolioList from '../components/PortfolioList';
import StockDetail from '../components/StockDetail';

// Manages the holdings list, selected ticker, and the analyse action that navigates to AnalysisPage.
export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const navigate = useNavigate();

  // Removes a holding and clears the selection if that holding was selected.
  function handleRemove(ticker: string) {
    setHoldings((prev) => prev.filter((h) => h.ticker !== ticker));
    if (selectedTicker === ticker) setSelectedTicker(null);
  }

  // Adds a holding only if the ticker is not already in the list.
  function handleAdd(holding: Holding) {
    setHoldings((prev) => {
      const exists = prev.find((h) => h.ticker === holding.ticker);
      if (exists) return prev;
      return [...prev, holding];
    });
  }

  // Calls the /analyse endpoint, persists results to localStorage, then navigates to the analysis page.
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
      // Persist to localStorage so AnalysisPage can read them after navigation.
      localStorage.setItem('holdings', JSON.stringify(holdings));
      localStorage.setItem('analysis', JSON.stringify(data.analysis));
      navigate('/analysis');
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>InvestLens</h1>
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

      {/* Holdings input and list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
        <PortfolioInput holdings={holdings} onAdd={handleAdd} />
        <PortfolioList
          holdings={holdings}
          selectedTicker={selectedTicker}
          onSelect={setSelectedTicker}
          onRemove={handleRemove}
        />
      </div>

      {/* Stock detail panel — always visible, centered below the holdings list */}
      <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <StockDetail ticker={selectedTicker} />
        </div>
      </div>
    </div>
  );
}
