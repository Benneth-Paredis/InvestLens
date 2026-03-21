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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ color: '#999', fontSize: '15px' }}>
          No analysis found. Go back and analyse your portfolio.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '16px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px' }}
        >
          Back to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', cursor: 'pointer', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '24px 0 0' }}>Portfolio Analysis</h1>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a2e', textAlign: 'center' }}>
          Sector Breakdown
        </p>
        <SectorPieChart holdings={holdings} />
      </div>

      <AnalysisSections analysis={analysis} />
    </div>
  );
}
