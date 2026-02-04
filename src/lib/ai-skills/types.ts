/**
 * AI Skills System - Type Definitions
 * Defines interfaces for the skill-based AI routing system
 */

/** Represents a specialized AI skill with its configuration */
export interface Skill {
  /** Unique identifier for the skill */
  id: string;
  /** Human-readable name */
  name: string;
  /** Brief description of what the skill does */
  description: string;
  /** Keywords that trigger this skill (lowercase) */
  triggers: string[];
  /** System prompt template for this skill */
  systemPrompt: string;
  /** Expected output format */
  outputFormat: 'text' | 'json';
}

/** Beat pattern structure for context */
export interface BeatPattern {
  bpm: number;
  timeSignature: string;
  pattern: number[][];
  instruments: string[];
}

/** Track information for context */
export interface TrackInfo {
  name: string;
  duration: number;
  path?: string;
}

/** User preferences for context */
export interface UserPreferences {
  genre?: string;
  mood?: string;
  language?: string;
}

/** Context passed to skills for enhanced responses */
export interface SkillContext {
  currentLyrics?: string;
  currentBeat?: BeatPattern;
  currentTrack?: TrackInfo;
  userPreferences?: UserPreferences;
}

/** Request structure for skill execution */
export interface SkillRequest {
  skill: Skill;
  userMessage: string;
  context: SkillContext;
}

/** Response from skill execution */
export interface SkillResponse {
  /** Raw content from AI */
  content: string;
  /** ID of the skill that handled the request */
  skillId: string;
  /** Parsed JSON data if outputFormat was 'json' */
  parsed?: Record<string, unknown>;
  /** Provider that generated the response */
  provider?: string;
}
