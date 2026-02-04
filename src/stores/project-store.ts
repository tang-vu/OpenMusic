/**
 * Project Store
 * Manages music projects with save/load functionality
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Project data structure */
export interface MusicProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  data: {
    lyrics: string;
    beats: {
      bpm: number;
      pattern: boolean[][];
    };
  };
}

interface ProjectState {
  projects: MusicProject[];
  currentProjectId: string | null;

  // Project CRUD
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;

  // Load/Save
  loadProject: (id: string) => MusicProject | null;
  saveCurrentProject: (data: Partial<MusicProject['data']>) => void;
  setCurrentProject: (id: string | null) => void;

  // Getters
  getCurrentProject: () => MusicProject | null;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const EMPTY_PATTERN = (): boolean[][] =>
  Array(8).fill(null).map(() => Array(16).fill(false));

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      createProject: (name: string) => {
        const id = generateId();
        const now = Date.now();
        const project: MusicProject = {
          id,
          name,
          createdAt: now,
          updatedAt: now,
          data: {
            lyrics: '',
            beats: {
              bpm: 120,
              pattern: EMPTY_PATTERN(),
            },
          },
        };
        set((state) => ({
          projects: [...state.projects, project],
          currentProjectId: id,
        }));
        return id;
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },

      renameProject: (id: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
        }));
      },

      loadProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          set({ currentProjectId: id });
        }
        return project || null;
      },

      saveCurrentProject: (data: Partial<MusicProject['data']>) => {
        const currentId = get().currentProjectId;
        if (!currentId) return;

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === currentId
              ? {
                  ...p,
                  updatedAt: Date.now(),
                  data: { ...p.data, ...data },
                }
              : p
          ),
        }));
      },

      setCurrentProject: (id: string | null) => {
        set({ currentProjectId: id });
      },

      getCurrentProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.currentProjectId) || null;
      },
    }),
    {
      name: 'openmusic-projects',
    }
  )
);
