import { create } from 'zustand';

export type ActiveTab = 'lyrics' | 'beats' | 'player' | 'ai' | 'settings';

interface UIStore {
  activeTab: ActiveTab;
  sidebarOpen: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'lyrics',
  sidebarOpen: true,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
