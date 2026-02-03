import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  path: string;
  duration?: number;
}

interface PlayerStore {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  position: number;
  setPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
  setVolume: (volume: number) => void;
  setPosition: (position: number) => void;
  play: () => void;
  pause: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 0.7,
  position: 0,
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTrack: (track) => set({ currentTrack: track, position: 0 }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setPosition: (position) => set({ position }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
}));
