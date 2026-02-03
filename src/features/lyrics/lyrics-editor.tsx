import { useState } from 'react';
import { LyricsToolbar } from './lyrics-toolbar';
import { AISuggestionsPanel } from './ai-suggestions-panel';

export function LyricsEditor() {
  const [content, setContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleInsertSection = (section: string) => {
    setContent((prev) => prev + `\n\n[${section}]\n`);
  };

  const handleClear = () => {
    if (confirm('Clear all lyrics?')) {
      setContent('');
    }
  };

  return (
    <div className="h-full flex gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <LyricsToolbar
          onInsertSection={handleInsertSection}
          onClear={handleClear}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your lyrics here..."
          className="flex-1 bg-surface-800 border border-surface-700 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {showSuggestions && (
        <AISuggestionsPanel onClose={() => setShowSuggestions(false)} />
      )}
    </div>
  );
}
