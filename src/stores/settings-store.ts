import { create } from 'zustand';

interface SettingsStore {
  theme: 'dark' | 'light';
  aiProvider: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setAIProvider: (provider: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'dark',
  aiProvider: 'openai',
  setTheme: (theme) => set({ theme }),
  setAIProvider: (provider) => set({ aiProvider: provider }),
}));
