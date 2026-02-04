/**
 * Lyrics Store
 * Persists lyrics content across tab switches
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LyricsState {
  content: string;
  setContent: (content: string) => void;
  clear: () => void;
}

export const useLyricsStore = create<LyricsState>()(
  persist(
    (set) => ({
      content: '',
      setContent: (content) => set({ content }),
      clear: () => set({ content: '' }),
    }),
    {
      name: 'openmusic-lyrics',
    }
  )
);
