// Parses a raw analysis string (which may contain markdown headers) into structured sections.

interface ParsedAnalysis {
  summary: string;
  risks: string;
  recommendations: string;
}

// Section names the parser recognises as header markers.
const SECTION_NAMES = ['summary', 'risks', 'recommendations'];

// Strips markdown formatting (##, **, trailing colons) from a line to produce a plain lowercase key.
function cleanHeader(line: string): string {
  return line
    .replace(/^#+\s*/, '')      // remove ## or ###
    .replace(/\*+/g, '')        // remove ** or *
    .replace(/:+$/, '')         // remove trailing colon
    .trim()
    .toLowerCase();
}

// Splits a raw multi-line analysis string into the three named sections.
export function parseAnalysis(raw: string): ParsedAnalysis {
  console.log('Raw analysis string:', raw);

  const sections: Record<string, string> = {};
  let currentSection: string | null = null;
  const currentContent: string[] = [];

  for (const line of raw.split('\n')) {
    const cleaned = cleanHeader(line);

    if (SECTION_NAMES.includes(cleaned)) {
      // Flush the previous section before starting a new one.
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
        currentContent.length = 0;
      }
      currentSection = cleaned;
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Flush the final section after the loop ends.
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return {
    summary: sections['summary'] ?? '',
    risks: sections['risks'] ?? '',
    recommendations: sections['recommendations'] ?? '',
  };
}
