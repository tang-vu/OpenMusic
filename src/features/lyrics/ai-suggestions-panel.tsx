/**
 * AI Suggestions Panel for Lyrics Editor
 * Provides AI-powered lyrics assistance with quick actions and custom prompts
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAISkills } from '@/hooks/use-ai-skills';
import { LyricsAIQuickActions } from './lyrics-ai-quick-actions';
import { useTranslation } from '@/lib/i18n';

interface AISuggestionsPanelProps {
  onClose: () => void;
  currentLyrics?: string;
  selectedText?: string;
  onInsertSuggestion?: (text: string) => void;
}

export function AISuggestionsPanel({
  onClose,
  currentLyrics,
  selectedText,
  onInsertSuggestion,
}: AISuggestionsPanelProps) {
  const { t } = useTranslation();
  const [customPrompt, setCustomPrompt] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { complete, isLoading, error, activeSkill } = useAISkills({
    defaultContext: { currentLyrics },
  });

  const handleAction = async (prompt: string) => {
    try {
      const response = await complete(prompt, {
        skillId: 'lyrics',
        context: { currentLyrics },
      });
      setSuggestion(response.content);
    } catch {
      // Error handled by hook
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      handleAction(customPrompt);
      setCustomPrompt('');
    }
  };

  const handleInsert = () => {
    if (suggestion && onInsertSuggestion) {
      onInsertSuggestion(suggestion);
      setSuggestion(null);
    }
  };

  return (
    <div className="w-80 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('lyrics.aiSuggestions')}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close suggestions panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <Card>
        <p className="text-sm text-gray-400 mb-3">{t('lyrics.quickActions')}</p>
        <LyricsAIQuickActions
          onAction={handleAction}
          currentLyrics={currentLyrics}
          selectedText={selectedText}
          isLoading={isLoading}
        />
      </Card>

      {/* Custom Prompt */}
      <Card>
        <form onSubmit={handleCustomSubmit}>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask anything about lyrics..."
            className="w-full bg-surface-700 border border-surface-600 rounded p-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={2}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="mt-2 w-full"
            disabled={isLoading || !customPrompt.trim()}
          >
            {isLoading ? t('common.loading') : t('ai.generate')}
          </Button>
        </form>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {/* Suggestion Result */}
      {suggestion && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">
              {activeSkill?.name || 'Suggestion'}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSuggestion(null)}
              >
                {t('lyrics.clear')}
              </Button>
              {onInsertSuggestion && (
                <Button size="sm" onClick={handleInsert}>
                  {t('lyrics.insert')}
                </Button>
              )}
            </div>
          </div>
          <div className="p-3 bg-surface-700 rounded border border-surface-600 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
              {suggestion}
            </pre>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!suggestion && !isLoading && !error && (
        <Card>
          <p className="text-gray-500 text-sm text-center py-4">
            Use quick actions or type a custom prompt to get AI suggestions
          </p>
        </Card>
      )}
    </div>
  );
}
