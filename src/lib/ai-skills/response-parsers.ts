/**
 * Response Parsers
 * Extract structured data from AI responses
 */

/** Maximum input length to prevent ReDoS attacks */
const MAX_INPUT_LENGTH = 50000;

/**
 * Safely truncate input to prevent ReDoS
 */
function safeInput(content: string): string {
  if (content.length > MAX_INPUT_LENGTH) {
    return content.slice(0, MAX_INPUT_LENGTH);
  }
  return content;
}

/**
 * Parse JSON from AI response content
 * Handles both raw JSON and JSON wrapped in markdown code blocks
 *
 * @param content - The AI response content
 * @returns Parsed JSON object or null if parsing fails
 */
export function parseJsonResponse(content: string): Record<string, unknown> | null {
  const safeContent = safeInput(content);

  // Try to extract JSON from markdown code block first
  const jsonBlockMatch = safeContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {
      // Continue to try other methods
    }
  }

  // Try to find JSON object in the content
  const jsonObjectMatch = safeContent.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]);
    } catch {
      // Continue to try direct parse
    }
  }

  // Try direct parse (content is pure JSON)
  try {
    return JSON.parse(safeContent.trim());
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize a number value
 */
function validateNumber(value: unknown, defaultValue: number, min = 0, max = 1000): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Validate and sanitize a string array
 */
function validateStringArray(value: unknown, defaultValue: string[]): string[] {
  if (!Array.isArray(value)) {
    return defaultValue;
  }
  return value
    .filter((item): item is string => typeof item === 'string')
    .slice(0, 20); // Limit array size
}

/**
 * Validate and sanitize a 2D number array (pattern)
 */
function validatePatternArray(value: unknown): number[][] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, 64).map((row) => {
    if (!Array.isArray(row)) return [];
    return row
      .slice(0, 16)
      .map((cell) => (typeof cell === 'number' && (cell === 0 || cell === 1) ? cell : 0));
  });
}

/**
 * Parse beat pattern from AI response
 * Validates the structure matches expected BeatPattern
 *
 * @param content - The AI response content
 * @returns Validated beat pattern or null
 */
export function parseBeatPattern(content: string): {
  bpm: number;
  timeSignature: string;
  bars: number;
  instruments: string[];
  pattern: number[][];
} | null {
  const parsed = parseJsonResponse(content);
  if (!parsed) return null;

  // Validate required fields
  if (
    typeof parsed.bpm !== 'number' ||
    typeof parsed.timeSignature !== 'string' ||
    !Array.isArray(parsed.pattern)
  ) {
    return null;
  }

  return {
    bpm: validateNumber(parsed.bpm, 120, 20, 300),
    timeSignature: String(parsed.timeSignature).slice(0, 10),
    bars: validateNumber(parsed.bars, 4, 1, 16),
    instruments: validateStringArray(parsed.instruments, ['kick', 'snare', 'hihat']),
    pattern: validatePatternArray(parsed.pattern),
  };
}

/**
 * Extract lyrics sections from AI response
 * Parses [Verse], [Chorus], etc. markers
 *
 * @param content - The AI response content
 * @returns Array of sections with labels and text
 */
export function parseLyricsSections(content: string): Array<{ label: string; text: string }> {
  const safeContent = safeInput(content);
  const sections: Array<{ label: string; text: string }> = [];
  const sectionPattern = /\[([^\]]+)\]\s*([\s\S]*?)(?=\[[^\]]+\]|$)/g;

  let match;
  let matchCount = 0;
  const maxMatches = 50; // Prevent infinite loops

  while ((match = sectionPattern.exec(safeContent)) !== null && matchCount < maxMatches) {
    matchCount++;
    const label = match[1].trim().slice(0, 50); // Limit label length
    const text = match[2].trim();
    if (text) {
      sections.push({ label, text });
    }
  }

  // If no sections found, return entire content as single section
  if (sections.length === 0 && safeContent.trim()) {
    sections.push({ label: 'Lyrics', text: safeContent.trim() });
  }

  return sections;
}

/**
 * Extract chord progression from AI response
 * Parses common chord notation
 *
 * @param content - The AI response content
 * @returns Array of chord names
 */
export function parseChordProgression(content: string): string[] {
  const safeContent = safeInput(content);
  // Simplified chord pattern to reduce ReDoS risk
  const chordPattern = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus2|sus4|add9)?(?:7|9|11|13)?(?:\/[A-G][#b]?)?)\b/g;
  const chords: string[] = [];

  let match;
  let matchCount = 0;
  const maxMatches = 100; // Limit matches

  while ((match = chordPattern.exec(safeContent)) !== null && matchCount < maxMatches) {
    matchCount++;
    // Avoid duplicates in sequence
    if (chords[chords.length - 1] !== match[1]) {
      chords.push(match[1]);
    }
  }

  return chords;
}
