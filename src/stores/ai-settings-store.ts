import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AISettingsState {
  selectedModel: string | null;
  setSelectedModel: (model: string) => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      selectedModel: null, // null = use first available model
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'ai-settings',
    }
  )
);
