/**
 * Lyrics Editor Component
 * Main editor for writing song lyrics with AI assistance
 */

import { useState, useRef, useCallback } from 'react';
import { LyricsToolbar } from './lyrics-toolbar';
import { AISuggestionsPanel } from './ai-suggestions-panel';
import { useTranslation } from '@/lib/i18n';

export function LyricsEditor() {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertSection = (section: string) => {
    setContent((prev) => prev + `\n\n[${section}]\n`);
  };

  const handleClear = () => {
    if (confirm('Clear all lyrics?')) {
      setContent('');
    }
  };

  const handleSelectionChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      setSelectedText(content.substring(start, end));
    } else {
      setSelectedText('');
    }
  }, [content]);

  const handleInsertSuggestion = (suggestion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      // No selection, append to end
      setContent((prev) => prev + '\n\n' + suggestion);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      // Replace selection
      const newContent =
        content.substring(0, start) + suggestion + content.substring(end);
      setContent(newContent);
    } else {
      // Insert at cursor or end
      const position = start || content.length;
      const prefix = position > 0 && !content.endsWith('\n') ? '\n\n' : '';
      const newContent =
        content.substring(0, position) +
        prefix +
        suggestion +
        content.substring(position);
      setContent(newContent);
    }

    setSelectedText('');
  };

  return (
    <div className="h-full flex gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <LyricsToolbar
          onInsertSection={handleInsertSection}
          onClear={handleClear}
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder={t('lyrics.placeholder')}
          className="flex-1 bg-surface-800 border border-surface-700 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {showSuggestions && (
        <AISuggestionsPanel
          onClose={() => setShowSuggestions(false)}
          currentLyrics={content}
          selectedText={selectedText}
          onInsertSuggestion={handleInsertSuggestion}
        />
      )}
    </div>
  );
}
