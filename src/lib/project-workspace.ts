import { useProjectStore } from '@/stores/project-store';
import { useLyricsStore } from '@/stores/lyrics-store';
import { useBeatsStore } from '@/stores/beats-store';

/** Save the active workspace before loading another existing project. */
export function switchProjectWorkspace(projectId: string): boolean {
  const projects = useProjectStore.getState();

  // A stale selection must not change or save the current workspace.
  if (!projects.projects.some((project) => project.id === projectId)) return false;
  if (projects.currentProjectId === projectId) return true;

  const { content: lyrics } = useLyricsStore.getState();
  const { bpm, pattern } = useBeatsStore.getState();
  projects.saveCurrentProject({ lyrics, beats: { bpm, pattern } });

  const project = projects.loadProject(projectId);
  if (!project) return false;

  useLyricsStore.getState().setContent(project.data.lyrics);
  useBeatsStore.getState().setBpm(project.data.beats.bpm);
  useBeatsStore.getState().setPattern(project.data.beats.pattern);
  return true;
}
