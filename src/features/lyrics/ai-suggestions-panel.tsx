import { Card } from '../../components/ui/card';

interface AISuggestionsPanelProps {
  onClose: () => void;
}

export function AISuggestionsPanel({ onClose }: AISuggestionsPanelProps) {
  return (
    <div className="w-80 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Suggestions</h3>
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
      <Card>
        <p className="text-gray-400 text-sm">
          AI suggestions will appear here when connected in Phase 06.
        </p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-surface-700 rounded border border-surface-600">
            <p className="text-sm text-gray-300">Rhyme suggestions</p>
          </div>
          <div className="p-3 bg-surface-700 rounded border border-surface-600">
            <p className="text-sm text-gray-300">Theme ideas</p>
          </div>
          <div className="p-3 bg-surface-700 rounded border border-surface-600">
            <p className="text-sm text-gray-300">Verse completions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
