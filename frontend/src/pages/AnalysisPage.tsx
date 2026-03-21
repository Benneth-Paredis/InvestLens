// Displays the AI-generated portfolio analysis and sector breakdown chart.

import { useNavigate } from 'react-router-dom';
import AnalysisSections from '../components/AnalysisSections';
import SectorPieChart from '../components/SectorPieChart';
import type { Holding } from '../types';

// Reads analysis and holdings from localStorage (written by PortfolioPage) and renders results.
export default function AnalysisPage() {
  const navigate = useNavigate();
  // Both values are written to localStorage by PortfolioPage before navigating here.
  const analysisRaw = localStorage.getItem('analysis');
  const analysis = analysisRaw ? JSON.parse(analysisRaw) : null;
  const holdingsRaw = localStorage.getItem('holdings');
  const holdings: Holding[] = holdingsRaw ? JSON.parse(holdingsRaw) : [];

  // Guard: redirect prompt if the user lands here without a prior analysis.
  if (!analysisRaw) {
    return (
      <div style={{ padding: '40px 48px' }}>
        <p style={{ color: '#999', fontSize: '15px' }}>
          No analysis found. Go back and analyse your portfolio.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '16px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 48px', boxSizing: 'border-box' }}>

      {/* Header row: title left, back button right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Portfolio Analysis</h1>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', fontWeight: 500 }}
        >
          ← Back
        </button>
      </div>

      {/* Two-column layout: pie chart left, analysis sections right */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* Left — pie chart card (35%) */}
        <div style={{
          width: '35%',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px',
          boxSizing: 'border-box',
        }}>
          <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a' }}>
            Sector Breakdown
          </p>
          <SectorPieChart holdings={holdings} />
        </div>

        {/* Right — analysis sections (65%) */}
        <div style={{ width: '65%' }}>
          <AnalysisSections analysis={analysis} />
        </div>

      </div>
    </div>
  );
}
