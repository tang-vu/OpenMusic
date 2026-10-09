import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ProjectSelector } from '../../src/components/project/project-selector';
import { LyricsEditor } from '../../src/features/lyrics/lyrics-editor';
import { useProjectStore } from '../../src/stores/project-store';
import { editWorkspace, seedProjects, workspace } from './project-fixtures';

vi.mock('../../src/features/lyrics/ai-suggestions-panel', () => ({ AISuggestionsPanel: () => null }));

beforeEach(seedProjects);
afterEach(cleanup);

function mount() {
  const result = render(<><ProjectSelector /><LyricsEditor /></>);
  return result.container.querySelector('textarea')!;
}

function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: /Song [AB]/ }));
}

it('wires the dropdown to preserve text typed in the real editor', () => {
  const editor = mount();
  fireEvent.change(editor, { target: { value: 'Typed new lyrics\nSecond verse' } });
  openMenu();
  fireEvent.click(screen.getByText('Song B'));
  expect(editor.value).toBe('b saved');
  openMenu();
  fireEvent.click(screen.getByText('Song A'));
  expect(editor.value).toBe('Typed new lyrics\nSecond verse');
});

it('closes the dropdown without losing edits when the active project is selected', () => {
  const editor = mount();
  fireEvent.change(editor, { target: { value: 'Unfinished lyric' } });
  openMenu();
  fireEvent.click(screen.getAllByText('Song A')[1]);
  expect(editor.value).toBe('Unfinished lyric');
  expect(screen.queryByText('+ New Project')).toBeNull();
});

it('keeps Create Project saving the outgoing workspace', () => {
  mount();
  act(() => editWorkspace('before create', 131, 9));
  const before = workspace();
  openMenu();
  fireEvent.click(screen.getByText('+ New Project'));
  fireEvent.change(screen.getByPlaceholderText('Project name...'), { target: { value: 'Song C' } });
  fireEvent.keyDown(screen.getByPlaceholderText('Project name...'), { key: 'Enter' });
  expect(useProjectStore.getState().projects.find((p) => p.id === 'a')!.data).toEqual(before);
  expect(workspace().lyrics).toBe('');
});

it('keeps Close Project saving the outgoing workspace', () => {
  mount();
  act(() => editWorkspace('before close', 131, 9));
  const before = workspace();
  openMenu();
  fireEvent.click(screen.getByText('Close Project'));
  expect(useProjectStore.getState().projects.find((p) => p.id === 'a')!.data).toEqual(before);
  expect(useProjectStore.getState().currentProjectId).toBeNull();
  expect(workspace().lyrics).toBe('');
});

it('keeps explicit Save and deleting an inactive project independent of the active draft', () => {
  mount();
  act(() => editWorkspace('explicitly saved'));
  openMenu();
  fireEvent.click(screen.getByText('💾 Save Project'));
  expect(useProjectStore.getState().projects[0].data.lyrics).toBe('explicitly saved');
  act(() => editWorkspace('still editing'));
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  fireEvent.click(screen.getAllByTitle('Delete project')[1]);
  expect(workspace().lyrics).toBe('still editing');
  expect(useProjectStore.getState().currentProjectId).toBe('a');
  expect(useProjectStore.getState().projects.map((p) => p.id)).toEqual(['a']);
});
