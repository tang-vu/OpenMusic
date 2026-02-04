/**
 * AI Command Palette Keyboard Trigger
 * Handles Cmd+K / Ctrl+K global shortcut
 */

import { useEffect } from 'react';
import { useAIPaletteStore } from '@/stores/ai-palette-store';

/**
 * Hook to register global keyboard shortcut for AI palette
 * Should be used once at app root level
 */
export function useAIPaletteShortcut() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useAIPaletteStore.getState().toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Component version for use in JSX
 */
export function AICommandPaletteTrigger() {
  useAIPaletteShortcut();
  return null;
}
