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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {sections.map(({ title, content }) => (
        <div
          key={title}
          style={{
            padding: '24px 28px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a2e' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap' }}>
            {content}
          </p>
        </div>
      ))}
    </div>
  );
}
