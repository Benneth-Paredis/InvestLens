// Main portfolio-building page where users add holdings, view stock details, and trigger analysis.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Holding, StockData } from '../types';
import PortfolioInput from '../components/PortfolioInput';
import PortfolioList from '../components/PortfolioList';
import StockDetail from '../components/StockDetail';

// Manages the holdings list, selected ticker, and the analyse action that navigates to AnalysisPage.
export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [stockDataMap, setStockDataMap] = useState<Record<string, StockData>>({});
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const navigate = useNavigate();

  // Total amount the user has invested in stocks
  const totalInvested = holdings.reduce((sum, h) => sum + h.amountInvested, 0);
  const currentWorth = holdings.reduce((sum, h) => {
    const data = stockDataMap[h.ticker];
    const price = data ? parseFloat(data.currentPrice.replace('$', '')) : 0;
    return sum + (isNaN(price) ? 0 : h.shares * price)
  }, 0);
  const gainLoss = currentWorth - totalInvested;
  const gainLossPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  // Load persisted holdings from the database on first render.
  useEffect(() => {
    fetch('/api/holdings')
      .then((r) => r.json())
      .then((data) => setHoldings(data.holdings));
  }, []);

  // Re-fetch stock data for all holdings whenever the list changes.
  useEffect(() => {
    if (holdings.length === 0) return;
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdings }),
    })
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, StockData> = {};
        for (const stock of data.portfolio) map[stock.ticker] = stock;
        setStockDataMap(map);
      });
  }, [holdings]);

  // Removes a holding from the database and updates local state.
  async function handleRemove(ticker: string) {
    await fetch(`/api/holdings/${ticker}`, { method: 'DELETE' });
    setHoldings((prev) => prev.filter((h) => h.ticker !== ticker));
    if (selectedTicker === ticker) setSelectedTicker(null);
  }

  // Persists a new holding to the database and updates local state.
  async function handleAdd(holding: Holding) {
    if (holdings.some((h) => h.ticker === holding.ticker)) return;
    await fetch('/api/holdings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holding),
    });
    setHoldings((prev) => [...prev, holding]);
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '40px 48px', boxSizing: 'border-box' }}>

      {/* Two-column layout filling the full viewport */}
      <div style={{ display: 'flex', gap: '48px', flex: 1, minHeight: 0, alignItems: 'stretch' }}>

        {/* Left column — 40% */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingLeft: '2px' }}>

          {/* Header stats — fixed, never scrolls */}
          <div style={{ flexShrink: 0, marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 16px', textAlign: 'center' }}>InvestLens</h1>
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Invested</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: holdings.length > 0 ? 700 : 400, color: holdings.length > 0 ? '#1a1a1a' : '#bbb' }}>
                  ${totalInvested.toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Current Worth</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: holdings.length > 0 ? 700 : 400, color: holdings.length > 0 ? '#1a1a1a' : '#bbb' }}>
                  ${currentWorth.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Gain / Loss</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: holdings.length > 0 ? 700 : 400, color: holdings.length === 0 ? '#bbb' : gainLoss >= 0 ? '#16a34a' : '#dc2626'}}>
                   {holdings.length === 0 ? '$0' : `${gainLoss >= 0 ? '+' : ''}$${gainLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${gainLossPct.toFixed(1)}%)`}
                </p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ flexShrink: 0, marginBottom: '32px' }}>
            <PortfolioInput holdings={holdings} onAdd={handleAdd} />
          </div>

          {/* Holdings list — grows to fill remaining space and scrolls */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginBottom: '32px' }}>
            <PortfolioList
              holdings={holdings}
              stockDataMap={stockDataMap}
              selectedTicker={selectedTicker}
              onSelect={setSelectedTicker}
              onRemove={handleRemove}
            />
          </div>

          {/* Analyse button — fixed at the bottom */}
          <div style={{ flexShrink: 0 }}>
            {holdings.length > 0 && (
              <button
                onClick={handleAnalyse}
                disabled={analysisLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: analysisLoading ? 'not-allowed' : 'pointer',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  opacity: analysisLoading ? 0.6 : 1,
                }}
              >
                {analysisLoading ? 'Analysing...' : 'Analyse Portfolio'}
              </button>
            )}
          </div>
        </div>

        {/* Right column — 60% */}
        <div style={{
          width: '60%',
          backgroundColor: '#f5f5f5',
          borderRadius: '16px',
          padding: '32px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          <StockDetail ticker={selectedTicker} />
        </div>

      </div>
    </div>
  );
}
