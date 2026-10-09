import { beforeEach, describe, expect, it, vi } from 'vitest';
import { switchProjectWorkspace } from '../../src/lib/project-workspace';
import { useProjectStore } from '../../src/stores/project-store';
import { useLyricsStore } from '../../src/stores/lyrics-store';
import { useBeatsStore } from '../../src/stores/beats-store';
import { editWorkspace, pattern, seedProjects, workspace } from './project-fixtures';

const saved = (id: string) => useProjectStore.getState().projects.find((p) => p.id === id)!.data;

describe('switchProjectWorkspace', () => {
  beforeEach(seedProjects);

  it('preserves latest lyrics, BPM and pattern across A → B → A', () => {
    editWorkspace('a edited\nSecond verse 🎵');
    const editedA = workspace();
    const originalB = saved('b');
    expect(switchProjectWorkspace('b')).toBe(true);
    expect(saved('a')).toEqual(editedA);
    expect(workspace()).toEqual(originalB);
    expect(switchProjectWorkspace('a')).toBe(true);
    expect(workspace()).toEqual(editedA);
    expect(saved('b')).toEqual(originalB);
  });

  it('keeps distinct edits for both projects through repeated switches', () => {
    editWorkspace('a latest', 91, 8);
    const editedA = workspace();
    switchProjectWorkspace('b');
    editWorkspace('b latest', 143, 12);
    const editedB = workspace();
    switchProjectWorkspace('a');
    expect(workspace()).toEqual(editedA);
    switchProjectWorkspace('b');
    expect(workspace()).toEqual(editedB);
    expect(saved('a')).toEqual(editedA);
  });

  it('reselects the active project without restoring or saving an older snapshot', () => {
    editWorkspace('still editing');
    const before = workspace();
    const project = useProjectStore.getState().getCurrentProject();
    const writes = vi.spyOn(Storage.prototype, 'setItem');
    expect(switchProjectWorkspace('a')).toBe(true);
    expect(workspace()).toEqual(before);
    expect(useProjectStore.getState().getCurrentProject()).toBe(project);
    expect(writes).not.toHaveBeenCalled();
  });

  it.each(['missing', 'deleted'])('ignores a %s target without modifying the workspace or snapshots', (target) => {
    if (target === 'deleted') useProjectStore.getState().deleteProject('b');
    editWorkspace('keep this draft');
    const before = workspace();
    const projectState = useProjectStore.getState();
    const writes = vi.spyOn(Storage.prototype, 'setItem');
    expect(switchProjectWorkspace(target === 'deleted' ? 'b' : 'missing')).toBe(false);
    expect(workspace()).toEqual(before);
    expect(useProjectStore.getState()).toBe(projectState);
    expect(writes).not.toHaveBeenCalled();
  });

  it('reads the latest stores when a previously captured switch action is invoked', () => {
    const switchToB = () => switchProjectWorkspace('b');
    editWorkspace('first edit');
    editWorkspace('latest edit', 99, 15);
    const latest = workspace();
    switchToB();
    expect(saved('a')).toEqual(latest);
  });

  it('loads a project when no project is active', () => {
    useProjectStore.getState().setCurrentProject(null);
    expect(switchProjectWorkspace('b')).toBe(true);
    expect(workspace()).toEqual(saved('b'));
    expect(useProjectStore.getState().currentProjectId).toBe('b');
  });

  it('persists the outgoing edits across Zustand rehydration', async () => {
    editWorkspace('a after restart', 145, 7);
    const edited = workspace();
    switchProjectWorkspace('b');
    const keys = ['openmusic-projects', 'openmusic-lyrics', 'openmusic-beats'];
    const persisted = keys.map((key) => [key, localStorage.getItem(key)!]);
    useProjectStore.setState({ projects: [], currentProjectId: null });
    useLyricsStore.setState({ content: '' });
    useBeatsStore.setState({ bpm: 120, pattern: pattern(-1) });
    persisted.forEach(([key, value]) => localStorage.setItem(key, value));
    await useProjectStore.persist.rehydrate();
    await useLyricsStore.persist.rehydrate();
    await useBeatsStore.persist.rehydrate();
    expect(useProjectStore.getState().currentProjectId).toBe('b');
    expect(workspace().lyrics).toBe('b saved');
    switchProjectWorkspace('a');
    expect(workspace()).toEqual(edited);
  });

  it('preserves an intentional empty edit instead of reviving old lyrics', () => {
    editWorkspace('', 120, -1);
    switchProjectWorkspace('b');
    switchProjectWorkspace('a');
    expect(workspace()).toEqual({ lyrics: '', beats: { bpm: 120, pattern: pattern(-1) } });
  });
});
