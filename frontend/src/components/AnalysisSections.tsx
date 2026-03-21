// Renders the three analysis sections (Summary, Risks, Recommendations) as styled cards.

interface AnalysisResult {
  summary: string;
  risks: string;
  recommendations: string;
}

interface Props {
  analysis: AnalysisResult;
}

// Displays each analysis section in a bordered card with pre-wrapped text.
export default function AnalysisSections({ analysis }: Props) {
  // Guard against non-string values (e.g. if the API returns nested objects).
  const toString = (val: unknown): string =>
    typeof val === 'string' ? val : JSON.stringify(val, null, 2);

  const sections = [
    { title: 'Summary', content: toString(analysis.summary) },
    { title: 'Risks', content: toString(analysis.risks) },
    { title: 'Recommendations', content: toString(analysis.recommendations) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a', textAlign: 'left' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {content}
          </p>
        </div>
      ))}
    </div>
  );
}
