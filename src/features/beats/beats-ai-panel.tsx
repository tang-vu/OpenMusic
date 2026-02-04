/**
 * Beats AI Panel
 * AI-powered beat pattern generation with genre presets and custom prompts
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAISkills } from '@/hooks/use-ai-skills';
import {
  parseBeatPatternFromResponse,
  beatPatternToGrid,
  getUnknownInstruments,
  type ParsedBeatPattern,
} from '@/lib/ai-skills/beat-pattern-parser';

/** Genre preset with prompt template */
interface GenrePreset {
  id: string;
  label: string;
  prompt: string;
}

const GENRE_PRESETS: GenrePreset[] = [
  { id: 'trap', label: 'Trap', prompt: 'Create a trap beat pattern with heavy 808 kick and hi-hat rolls' },
  { id: 'boombap', label: 'Boom Bap', prompt: 'Create a classic boom bap hip hop pattern with swing' },
  { id: 'house', label: 'House', prompt: 'Create a four-on-the-floor house pattern with off-beat hi-hats' },
  { id: 'lofi', label: 'Lo-Fi', prompt: 'Create a laid-back lo-fi hip hop pattern with sparse hits' },
  { id: 'drill', label: 'Drill', prompt: 'Create a UK drill pattern with sliding hi-hats' },
  { id: 'funk', label: 'Funk', prompt: 'Create a funky breakbeat pattern with syncopation' },
];

interface BeatsAIPanelProps {
  currentBpm: number;
  onPatternGenerated: (grid: boolean[][], patternInfo?: { name?: string; bpm?: number }) => void;
  onClose?: () => void;
}

export function BeatsAIPanel({ currentBpm, onPatternGenerated, onClose }: BeatsAIPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastPattern, setLastPattern] = useState<ParsedBeatPattern | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const { complete, isLoading, error } = useAISkills();

  const handleGenerate = async (prompt: string) => {
    setWarning(null);
    setLastPattern(null);

    try {
      const response = await complete(prompt, { skillId: 'beats' });

      // Parse the JSON response
      const pattern = parseBeatPatternFromResponse(response.content);

      if (!pattern) {
        setWarning('Could not parse beat pattern from AI response. Try a different prompt.');
        return;
      }

      setLastPattern(pattern);

      // Check for unknown instruments
      const unknown = getUnknownInstruments(pattern);
      if (unknown.length > 0) {
        setWarning(`Some instruments not recognized: ${unknown.join(', ')}`);
      }

      // Convert to grid and apply
      const grid = beatPatternToGrid(pattern);
      onPatternGenerated(grid, { name: pattern.name, bpm: pattern.bpm });
    } catch {
      // Error handled by hook
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      handleGenerate(customPrompt);
    }
  };

  return (
    <div className="w-72 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Beat Generator</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close AI panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Genre Presets */}
      <Card>
        <p className="text-xs text-gray-400 mb-2">Quick Genres</p>
        <div className="grid grid-cols-3 gap-1">
          {GENRE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              variant="ghost"
              className="text-xs px-2 py-1"
              disabled={isLoading}
              onClick={() => handleGenerate(preset.prompt)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Custom Prompt */}
      <Card>
        <form onSubmit={handleCustomSubmit}>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`Describe your beat... (${currentBpm} BPM)`}
            className="w-full bg-surface-700 border border-surface-600 rounded p-2 text-xs text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={2}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="mt-2 w-full text-xs"
            disabled={isLoading || !customPrompt.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate Pattern'}
          </Button>
        </form>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50">
          <p className="text-xs text-red-400">{error}</p>
        </Card>
      )}

      {/* Warning Display */}
      {warning && (
        <Card className="border-yellow-500/50">
          <p className="text-xs text-yellow-400">{warning}</p>
        </Card>
      )}

      {/* Pattern Info */}
      {lastPattern && (
        <Card>
          <p className="text-xs text-gray-400">
            Generated: {lastPattern.name || 'Pattern'}
            {lastPattern.bpm && ` • ${lastPattern.bpm} BPM`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {lastPattern.tracks.length} tracks applied
          </p>
        </Card>
      )}
    </div>
  );
}
