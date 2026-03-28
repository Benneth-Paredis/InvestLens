// Renders the analysis sections (Summary, Risks, Opportunities, Recommendations) and portfolio score.

interface AnalysisResult {
  summary: string;
  risks: string;
  opportunities: string;
  recommendations: string;
  score: number;
  scoreJustification: string;
}

interface Props {
  analysis: AnalysisResult;
}

// Parses a bullet string ("- foo\n- bar") into an array of bullet strings.
function parseBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\\n|\n/)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

function scoreColor(score: number): string {
  if (score >= 7) return '#16a34a';
  if (score >= 4) return '#d97706';
  return '#dc2626';
}

function scoreBg(score: number): string {
  if (score >= 7) return '#f0fdf4';
  if (score >= 4) return '#fffbeb';
  return '#fef2f2';
}

function scoreBorder(score: number): string {
  if (score >= 7) return '#bbf7d0';
  if (score >= 4) return '#fde68a';
  return '#fecaca';
}

function BulletList({ text }: { text: string }) {
  const bullets = parseBullets(text);
  if (bullets.length === 0) return <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{text}</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {bullets.map((b, i) => (
        <li key={i} style={{ fontSize: '15px', lineHeight: 1.7, color: '#333' }}>{b}</li>
      ))}
    </ul>
  );
}

export default function AnalysisSections({ analysis }: Props) {
  const score = typeof analysis.score === 'number' ? analysis.score : parseInt(String(analysis.score), 10);

  const sections = [
    { title: 'Summary', content: analysis.summary },
    { title: 'Risks', content: analysis.risks },
    { title: 'Opportunities', content: analysis.opportunities },
    { title: 'Recommendations', content: analysis.recommendations },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Portfolio health score */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '8px',
        backgroundColor: scoreBg(score),
        border: `1px solid ${scoreBorder(score)}`,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: scoreColor(score) }}>
            {isNaN(score) ? '–' : score}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: scoreColor(score), marginTop: '4px' }}>
            / 10
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a' }}>
            Portfolio Health Score
          </p>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
            {analysis.scoreJustification}
          </p>
        </div>
      </div>

      {/* Analysis sections */}
      {sections.map(({ title, content }) => (
        <div
          key={title}
          style={{
            padding: '24px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            boxSizing: 'border-box',
          }}
        >
          <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a' }}>
            {title}
          </p>
          <BulletList text={typeof content === 'string' ? content : JSON.stringify(content)} />
        </div>
      ))}

    </div>
  );
}
