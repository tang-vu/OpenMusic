/**
 * AI Command Palette
 * Universal AI access via Cmd+K with context-aware suggestions
 */

import { useEffect, useState, useRef } from 'react';
import { useAIPaletteStore } from '@/stores/ai-palette-store';
import { useAppContext, getContextSuggestions, getSkillForContext } from '@/hooks/use-app-context';
import { useAISkills } from '@/hooks/use-ai-skills';

export function AICommandPalette() {
  const { isOpen, close } = useAIPaletteStore();
  const context = useAppContext();
  const { complete, isLoading, error } = useAISkills();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = getContextSuggestions(context);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setInput('');
      setResult(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Handle escape and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (result) {
          setResult(null);
        } else {
          close();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, result, suggestions.length]);

  if (!isOpen) return null;

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    try {
      const skillId = getSkillForContext(context);
      const response = await complete(text, { skillId });
      setResult(response.content);
    } catch {
      // Error handled by hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit(input);
      } else if (suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex]);
      }
    }
  };

  const contextLabel = context.charAt(0).toUpperCase() + context.slice(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-full max-w-lg bg-surface-800 rounded-xl shadow-2xl border border-surface-600 overflow-hidden">
        {/* Input */}
        <div className="p-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <span className="text-primary-400">✦</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI anything..."
              className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 outline-none"
              disabled={isLoading}
            />
            {isLoading && (
              <span className="text-sm text-gray-400 animate-pulse">Thinking...</span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-4 border-b border-surface-700 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">AI Response</span>
              <button
                onClick={() => setResult(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
              {result}
            </pre>
          </div>
        )}

        {/* Suggestions */}
        {!result && (
          <div className="py-2">
            <div className="px-4 py-1 text-xs text-gray-500">
              Context: {contextLabel}
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSubmit(suggestion)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-surface-700 text-white'
                    : 'text-gray-300 hover:bg-surface-700'
                }`}
              >
                <span className="text-gray-500 mr-2">→</span>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 bg-surface-900/50 text-xs text-gray-500 flex justify-between">
          <span>↑↓ Navigate • Enter Submit • Esc Close</span>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
