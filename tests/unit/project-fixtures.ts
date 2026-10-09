import { useProjectStore, type MusicProject } from '../../src/stores/project-store';
import { useLyricsStore } from '../../src/stores/lyrics-store';
import { useBeatsStore } from '../../src/stores/beats-store';

export const pattern = (step: number) =>
  Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 16 }, (_, column) => row === 0 && column === step));

export function seedProjects() {
  localStorage.clear();
  const projects: MusicProject[] = ['a', 'b'].map((id, index) => ({
    id,
    name: `Song ${id.toUpperCase()}`,
    createdAt: 1,
    updatedAt: 1,
    data: { lyrics: `${id} saved`, beats: { bpm: 110 + index * 10, pattern: pattern(index) } },
  }));
  useProjectStore.setState({ projects, currentProjectId: 'a' });
  useLyricsStore.setState({ content: projects[0].data.lyrics });
  useBeatsStore.setState(projects[0].data.beats);
}

export function editWorkspace(lyrics: string, bpm = 137, step = 3) {
  useLyricsStore.getState().setContent(lyrics);
  useBeatsStore.getState().setBpm(bpm);
  useBeatsStore.getState().setPattern(pattern(step));
}

export function workspace() {
  const { bpm, pattern } = useBeatsStore.getState();
  return { lyrics: useLyricsStore.getState().content, beats: { bpm, pattern } };
}
