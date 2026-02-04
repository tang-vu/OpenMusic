/**
 * Lyrics AI Quick Actions
 * Provides quick action buttons for common lyrics AI operations
 */

import { Button } from '@/components/ui/button';

interface LyricsAction {
  id: string;
  label: string;
  icon: string;
  getPrompt: (context: { selectedText?: string; lyrics?: string }) => string;
  requiresSelection?: boolean;
}

const LYRICS_ACTIONS: LyricsAction[] = [
  {
    id: 'continue',
    label: 'Continue',
    icon: '→',
    getPrompt: ({ lyrics }) =>
      lyrics
        ? `Continue these lyrics naturally, maintaining the style and theme:\n\n${lyrics}`
        : 'Write the beginning of a song',
  },
  {
    id: 'chorus',
    label: 'Add Chorus',
    icon: '♫',
    getPrompt: ({ lyrics }) =>
      lyrics
        ? `Write a catchy, memorable chorus for these lyrics:\n\n${lyrics}`
        : 'Write a catchy song chorus',
  },
  {
    id: 'verse',
    label: 'Add Verse',
    icon: '¶',
    getPrompt: ({ lyrics }) =>
      lyrics
        ? `Write another verse that fits the theme and style:\n\n${lyrics}`
        : 'Write a song verse',
  },
  {
    id: 'rhymes',
    label: 'Find Rhymes',
    icon: '≈',
    getPrompt: ({ selectedText }) =>
      `Find creative rhymes for: "${selectedText}". Provide options with different syllable counts.`,
    requiresSelection: true,
  },
  {
    id: 'rewrite',
    label: 'Rewrite',
    icon: '↻',
    getPrompt: ({ selectedText }) =>
      `Rewrite this section with improved imagery and flow:\n\n${selectedText}`,
    requiresSelection: true,
  },
];

interface LyricsAIQuickActionsProps {
  onAction: (prompt: string) => void;
  currentLyrics?: string;
  selectedText?: string;
  isLoading: boolean;
}

export function LyricsAIQuickActions({
  onAction,
  currentLyrics,
  selectedText,
  isLoading,
}: LyricsAIQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {LYRICS_ACTIONS.map((action) => {
        const isDisabled =
          isLoading || (action.requiresSelection && !selectedText);

        return (
          <Button
            key={action.id}
            size="sm"
            variant="ghost"
            disabled={isDisabled}
            onClick={() =>
              onAction(
                action.getPrompt({ selectedText, lyrics: currentLyrics })
              )
            }
            className="text-xs"
            title={action.requiresSelection ? 'Select text first' : undefined}
          >
            <span className="mr-1">{action.icon}</span>
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
