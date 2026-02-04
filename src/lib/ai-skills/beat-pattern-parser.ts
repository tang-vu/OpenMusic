/**
 * Beat Pattern Parser
 * Parses and validates AI-generated beat patterns for the pattern grid
 */

/** Maximum input length to prevent ReDoS attacks */
const MAX_INPUT_LENGTH = 50000;

/** Maximum number of tracks to parse */
const MAX_TRACKS = 16;

/** Grid dimensions */
const GRID_ROWS = 8;
const GRID_COLS = 16;

/** Parsed beat pattern from AI response */
export interface ParsedBeatPattern {
  name?: string;
  bpm?: number;
  tracks: {
    instrument: string;
    steps: boolean[];
  }[];
}

/** Instrument name mapping to grid row indices */
const INSTRUMENT_TO_ROW: Record<string, number> = {
  kick: 0,
  snare: 1,
  hihat: 2,
  'hi-hat': 2,
  'hi hat': 2,
  tom: 3,
  'tom 1': 3,
  'tom1': 3,
  'tom 2': 4,
  'tom2': 4,
  clap: 5,
  cymbal: 6,
  crash: 6,
  perc: 7,
  percussion: 7,
  rim: 7,
  shaker: 7,
};

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
 * Validate and sanitize BPM value
 */
function validateBpm(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  // Clamp to reasonable BPM range
  return Math.max(20, Math.min(300, Math.round(value)));
}

/**
 * Validate and sanitize track name
 */
function validateTrackName(value: unknown): string {
  if (typeof value !== 'string') {
    return 'unknown';
  }
  // Limit length and lowercase
  return value.slice(0, 50).toLowerCase().trim() || 'unknown';
}

/**
 * Parse beat pattern JSON from AI response
 * Handles JSON in markdown code blocks or raw JSON
 */
export function parseBeatPatternFromResponse(content: string): ParsedBeatPattern | null {
  const safeContent = safeInput(content);

  // Try to extract JSON from markdown code block
  const jsonBlockMatch = safeContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : safeContent.trim();

  // Try to find JSON object if not in code block
  let parseTarget = jsonStr;
  if (!jsonStr.startsWith('{')) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parseTarget = jsonMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(parseTarget);

    // Validate parsed is an object
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    // Validate tracks array exists
    if (!Array.isArray(parsed.tracks)) {
      return null;
    }

    // Validate and normalize each track (limit count)
    const normalizedTracks = parsed.tracks
      .slice(0, MAX_TRACKS)
      .map((track: unknown) => {
        // Validate track is an object
        if (typeof track !== 'object' || track === null) {
          return null;
        }

        const trackObj = track as Record<string, unknown>;
        const instrument = validateTrackName(trackObj.instrument);
        let steps: boolean[] = [];

        if (Array.isArray(trackObj.steps)) {
          // Convert to boolean array, handle various formats
          steps = trackObj.steps.slice(0, GRID_COLS).map((s: unknown) => {
            if (typeof s === 'boolean') return s;
            if (typeof s === 'number') return s === 1;
            if (typeof s === 'string') return s === '1' || s.toLowerCase() === 'true';
            return false;
          });
        }

        // Pad to GRID_COLS steps
        while (steps.length < GRID_COLS) {
          steps.push(false);
        }

        return { instrument, steps };
      })
      .filter((track: { instrument: string; steps: boolean[] } | null): track is { instrument: string; steps: boolean[] } => track !== null);

    // Validate name if present
    const name = typeof parsed.name === 'string'
      ? parsed.name.slice(0, 100)
      : undefined;

    return {
      name,
      bpm: validateBpm(parsed.bpm),
      tracks: normalizedTracks,
    };
  } catch {
    return null;
  }
}

/**
 * Convert parsed beat pattern to grid format (8 rows × 16 cols)
 * Maps instrument names to grid row indices
 */
export function beatPatternToGrid(pattern: ParsedBeatPattern): boolean[][] {
  // Initialize empty grid
  const grid: boolean[][] = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(false));

  for (const track of pattern.tracks) {
    const rowIndex = INSTRUMENT_TO_ROW[track.instrument.toLowerCase()];
    if (rowIndex !== undefined && rowIndex < GRID_ROWS) {
      // Apply steps to this row
      for (let i = 0; i < GRID_COLS && i < track.steps.length; i++) {
        grid[rowIndex][i] = track.steps[i];
      }
    }
  }

  return grid;
}

/**
 * Get list of unrecognized instruments from pattern
 * Useful for showing warnings to user
 */
export function getUnknownInstruments(pattern: ParsedBeatPattern): string[] {
  return pattern.tracks
    .filter((t) => INSTRUMENT_TO_ROW[t.instrument.toLowerCase()] === undefined)
    .map((t) => t.instrument);
}
