interface ParsedAnalysis {
  summary: string;
  risks: string;
  recommendations: string;
}

const SECTION_NAMES = ['summary', 'risks', 'recommendations'];

function cleanHeader(line: string): string {
  return line
    .replace(/^#+\s*/, '')      // remove ## or ###
    .replace(/\*+/g, '')        // remove ** or *
    .replace(/:+$/, '')         // remove trailing colon
    .trim()
    .toLowerCase();
}

export function parseAnalysis(raw: string): ParsedAnalysis {
  console.log('Raw analysis string:', raw);

  const sections: Record<string, string> = {};
  let currentSection: string | null = null;
  const currentContent: string[] = [];

  for (const line of raw.split('\n')) {
    const cleaned = cleanHeader(line);

    if (SECTION_NAMES.includes(cleaned)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
        currentContent.length = 0;
      }
      currentSection = cleaned;
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return {
    summary: sections['summary'] ?? '',
    risks: sections['risks'] ?? '',
    recommendations: sections['recommendations'] ?? '',
  };
}
