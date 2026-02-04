/**
 * App Context Hook
 * Detects current app context for AI routing
 */

import { useUIStore } from '@/stores/ui-store';

export type AppContext = 'lyrics' | 'beats' | 'player' | 'settings' | 'general';

/** Context-specific suggestions for command palette */
const CONTEXT_SUGGESTIONS: Record<AppContext, string[]> = {
  lyrics: [
    'Write a verse about...',
    'Continue the lyrics',
    'Find rhymes for the last line',
    'Add a chorus',
  ],
  beats: [
    'Create a trap pattern',
    'Make a boom bap beat',
    'Add hi-hat variation',
    'Suggest a fill',
  ],
  player: [
    'Analyze this track',
    'Identify the key and tempo',
    'Suggest similar songs',
  ],
  settings: [
    'Help with AI settings',
    'How do I connect to CLIProxyAPI?',
  ],
  general: [
    'Help me write a song',
    'Explain chord progressions',
    'Suggest a melody idea',
    'Music theory basics',
  ],
};

/**
 * Hook to detect current app context based on active tab
 */
export function useAppContext(): AppContext {
  const activeTab = useUIStore((s) => s.activeTab);

  switch (activeTab) {
    case 'lyrics':
      return 'lyrics';
    case 'beats':
      return 'beats';
    case 'player':
      return 'player';
    case 'settings':
      return 'settings';
    default:
      return 'general';
  }
}

/**
 * Get context-specific suggestions for the command palette
 */
export function getContextSuggestions(context: AppContext): string[] {
  return CONTEXT_SUGGESTIONS[context];
}

/**
 * Get the skill ID that should handle a given context
 */
export function getSkillForContext(context: AppContext): string {
  switch (context) {
    case 'lyrics':
      return 'lyrics';
    case 'beats':
      return 'beats';
    default:
      return 'general';
  }
}
