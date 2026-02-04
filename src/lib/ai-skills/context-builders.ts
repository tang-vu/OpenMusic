/**
 * Context Builders
 * Extract relevant app state to inject into AI prompts
 */

import type { SkillContext, BeatPattern, TrackInfo, UserPreferences } from './types';

/**
 * Build lyrics context from the lyrics store/state
 * @param lyricsText - Current lyrics text from the editor
 */
export function buildLyricsContext(lyricsText?: string): Partial<SkillContext> {
  if (!lyricsText || lyricsText.trim().length === 0) {
    return {};
  }

  return {
    currentLyrics: lyricsText,
  };
}

/**
 * Build beat context from the beats store/state
 * @param pattern - Current beat pattern configuration
 */
export function buildBeatsContext(pattern?: BeatPattern): Partial<SkillContext> {
  if (!pattern) {
    return {};
  }

  return {
    currentBeat: pattern,
  };
}

/**
 * Build track context from the player store/state
 * @param track - Current track information
 */
export function buildPlayerContext(track?: TrackInfo): Partial<SkillContext> {
  if (!track) {
    return {};
  }

  return {
    currentTrack: track,
  };
}

/**
 * Build user preferences context
 * @param preferences - User's stored preferences
 */
export function buildPreferencesContext(preferences?: UserPreferences): Partial<SkillContext> {
  if (!preferences) {
    return {};
  }

  return {
    userPreferences: preferences,
  };
}

/**
 * Build full context by combining all sources
 * This is the main function used by the AI hook
 *
 * @param options - Optional context sources
 */
export function buildFullContext(options?: {
  lyrics?: string;
  beat?: BeatPattern;
  track?: TrackInfo;
  preferences?: UserPreferences;
}): SkillContext {
  return {
    ...buildLyricsContext(options?.lyrics),
    ...buildBeatsContext(options?.beat),
    ...buildPlayerContext(options?.track),
    ...buildPreferencesContext(options?.preferences),
  };
}

/**
 * Format context for injection into system prompt
 * Only includes non-empty fields
 */
export function formatContextForPrompt(context: SkillContext): string {
  const parts: string[] = [];

  if (context.currentLyrics) {
    parts.push(`Current Lyrics:\n${context.currentLyrics}`);
  }

  if (context.currentBeat) {
    parts.push(`Current Beat: ${context.currentBeat.bpm} BPM, ${context.currentBeat.timeSignature}`);
  }

  if (context.currentTrack) {
    parts.push(`Playing: ${context.currentTrack.name}`);
  }

  if (context.userPreferences) {
    const prefs = context.userPreferences;
    const prefParts = [];
    if (prefs.genre) prefParts.push(`Genre: ${prefs.genre}`);
    if (prefs.mood) prefParts.push(`Mood: ${prefs.mood}`);
    if (prefs.language) prefParts.push(`Language: ${prefs.language}`);
    if (prefParts.length > 0) {
      parts.push(`Preferences: ${prefParts.join(', ')}`);
    }
  }

  if (parts.length === 0) {
    return '';
  }

  return `\n---\nContext:\n${parts.join('\n\n')}`;
}
