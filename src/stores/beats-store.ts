/**
 * Beats Store
 * Persists beat pattern and BPM across tab switches
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BeatsState {
  bpm: number;
  pattern: boolean[][];
  setBpm: (bpm: number) => void;
  setPattern: (pattern: boolean[][]) => void;
  toggleCell: (row: number, col: number) => void;
  clear: () => void;
}

const EMPTY_PATTERN = (): boolean[][] =>
  Array(8).fill(null).map(() => Array(16).fill(false));

export const useBeatsStore = create<BeatsState>()(
  persist(
    (set) => ({
      bpm: 120,
      pattern: EMPTY_PATTERN(),
      setBpm: (bpm) => set({ bpm }),
      setPattern: (pattern) => set({ pattern }),
      toggleCell: (row, col) =>
        set((state) => {
          const newPattern = state.pattern.map((r) => [...r]);
          newPattern[row][col] = !newPattern[row][col];
          return { pattern: newPattern };
        }),
      clear: () => set({ pattern: EMPTY_PATTERN() }),
    }),
    {
      name: 'openmusic-beats',
    }
  )
);
