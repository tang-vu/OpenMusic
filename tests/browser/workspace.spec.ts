import { test, expect, type Page } from '@playwright/test';

const editor = (page: Page) => page.getByPlaceholder('Start writing your lyrics here...');
async function choose(page: Page, current: string, target: string) {
  await page.getByRole('button', { name: new RegExp(current) }).click();
  await page.getByText(target, { exact: true }).last().click();
}
async function snapshot(page: Page) {
  return page.evaluate(() => ({
    projects: JSON.parse(localStorage.getItem('openmusic-projects')!).state,
    lyrics: JSON.parse(localStorage.getItem('openmusic-lyrics')!).state.content,
    beats: JSON.parse(localStorage.getItem('openmusic-beats')!).state,
  }));
}

test.beforeEach(async ({ page }) => {
  // Keep tests on the local fixture origin. No provider or other external request is allowed.
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  await page.addInitScript(() => {
    if (localStorage.getItem('openmusic-test-seeded')) return;
    const pattern = (step: number) => Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 16 }, (_, column) => row === 0 && column === step));
    const projects = ['a', 'b'].map((id, i) => ({
      id, name: `Song ${id.toUpperCase()}`, createdAt: 1, updatedAt: 1,
      data: { lyrics: `${id} saved`, beats: { bpm: 110 + i * 10, pattern: pattern(i) } },
    }));
    localStorage.setItem('openmusic-projects', JSON.stringify({ state: { projects, currentProjectId: 'a' }, version: 0 }));
    localStorage.setItem('openmusic-lyrics', JSON.stringify({ state: { content: 'a saved' }, version: 0 }));
    localStorage.setItem('openmusic-beats', JSON.stringify({ state: projects[0].data.beats, version: 0 }));
    localStorage.setItem('openmusic-test-seeded', 'true');
  });
  await page.goto('/tests/browser/');
});

test('keyboard lyric and beat edits survive A → B → A and actual page reload', async ({ page }, testInfo) => {
  await editor(page).fill('Verse A');
  await editor(page).press('End');
  await editor(page).press('Enter');
  await editor(page).pressSequentially('A new second line');
  await page.getByRole('slider').focus();
  await page.getByRole('slider').press('ArrowRight');
  await page.getByRole('button', { name: 'Toggle Kick at step 4', exact: true }).focus();
  await page.keyboard.press('Space');
  const editedA = await snapshot(page);
  await choose(page, 'Song A', 'Song B');
  await expect(editor(page)).toHaveValue('b saved');
  await editor(page).fill('B has its own verse');
  await page.getByRole('slider').press('ArrowRight');
  const editedB = await snapshot(page);
  await choose(page, 'Song B', 'Song A');
  await expect(editor(page)).toHaveValue(editedA.lyrics);
  expect((await snapshot(page)).beats).toEqual(editedA.beats);
  await page.reload();
  await expect(editor(page)).toHaveValue(editedA.lyrics);
  await choose(page, 'Song A', 'Song B');
  await expect(editor(page)).toHaveValue(editedB.lyrics);
  expect((await snapshot(page)).beats).toEqual(editedB.beats);
  await choose(page, 'Song B', 'Song A');
  const final = await snapshot(page);
  expect(final.projects.projects.find((p: { id: string }) => p.id === 'a').data.lyrics).toBe(editedA.lyrics);
  expect(final.projects.projects.find((p: { id: string }) => p.id === 'b').data.lyrics).toBe(editedB.lyrics);
  await testInfo.attach('preserved-project-snapshots', { body: JSON.stringify(final, null, 2), contentType: 'application/json' });
  await page.screenshot({ path: testInfo.outputPath('workspace-after-switch-and-reload.png'), fullPage: true });
});

test('selecting the active project twice keeps the latest draft', async ({ page }, testInfo) => {
  await editor(page).fill('Unfinished chorus\nStill editing 🎵');
  const before = await snapshot(page);
  await choose(page, 'Song A', 'Song A');
  await choose(page, 'Song A', 'Song A');
  await expect(editor(page)).toHaveValue(before.lyrics);
  expect(await snapshot(page)).toEqual(before);
  await expect(page.getByText('+ New Project', { exact: true })).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath('active-project-draft-retained.png'), fullPage: true });
});

test('Save and Close remain keyboard-operable and preserve edits', async ({ page }) => {
  await editor(page).fill('Saved through keyboard');
  await page.getByRole('button', { name: /Song A/ }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '💾 Save Project' }).focus();
  await page.keyboard.press('Enter');
  expect((await snapshot(page)).projects.projects[0].data.lyrics).toBe('Saved through keyboard');
  await page.locator('.fixed.inset-0.z-40').click({ position: { x: 2, y: 2 } });
  await editor(page).fill('Saved when closing');
  await page.getByRole('button', { name: /Song A/ }).click();
  await page.getByRole('button', { name: 'Close Project', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(editor(page)).toHaveValue('');
  await choose(page, 'No Project', 'Song A');
  await expect(editor(page)).toHaveValue('Saved when closing');
});

test('creating a project with Enter saves the outgoing lyrics', async ({ page }) => {
  await editor(page).fill('A before a new project');
  await page.getByRole('button', { name: /Song A/ }).click();
  await page.getByRole('button', { name: '+ New Project', exact: true }).click();
  await page.getByPlaceholder('Project name...').fill('Song C');
  await page.getByPlaceholder('Project name...').press('Enter');
  await expect(editor(page)).toHaveValue('');
  await choose(page, 'Song C', 'Song A');
  await expect(editor(page)).toHaveValue('A before a new project');
});

test('an intentional empty lyric stays empty after switching and reload', async ({ page }) => {
  await editor(page).fill('');
  await choose(page, 'Song A', 'Song B');
  await page.reload();
  await choose(page, 'Song B', 'Song A');
  await expect(editor(page)).toHaveValue('');
});
