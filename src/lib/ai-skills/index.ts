/**
 * AI Skills System - Public API
 * Re-exports all skill-related functionality
 */

// Types
export type {
  Skill,
  SkillContext,
  SkillRequest,
  SkillResponse,
  BeatPattern,
  TrackInfo,
  UserPreferences,
} from './types';

// Registry
export { skills, getSkillById, getFallbackSkill } from './skill-registry';

// Router
export { routeToSkill, getMatchingSkills, forceSkill } from './skill-router';

// Context Builders
export {
  buildLyricsContext,
  buildBeatsContext,
  buildPlayerContext,
  buildPreferencesContext,
  buildFullContext,
  formatContextForPrompt,
} from './context-builders';

// Response Parsers
export {
  parseJsonResponse,
  parseBeatPattern,
  parseLyricsSections,
  parseChordProgression,
} from './response-parsers';
