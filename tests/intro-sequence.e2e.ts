import { expect, test } from '@playwright/test';
import { FAST, gotoHydrated, skipToSite } from './journeys';

test('standby dossier shows with scroll locked', async ({ page }) => {
	await gotoHydrated(page, FAST);
	await expect(page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' })).toBeVisible();
	await expect(page.getByText('PERSONNEL DOSSIER // MS-PILOT REGISTRY')).toBeVisible();
	await expect(page.getByText(/FILM REEL: \d+% LOADED/)).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
});

test('initiate runs countdown, film, and lands on the site unlocked', async ({ page }) => {
	await gotoHydrated(page, FAST);
	await page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' }).click();
	await expect(page.getByText('REEL 0083 // PICTURE START')).toBeVisible();
	await expect(page.getByText(/REEL 0083 \/\/ FRAME \d{3} \/ 120/)).toBeVisible({
		timeout: 5000
	});
	// Full run at fps=24: 2s ignite + 5s film + 5.45s starrise/reveal, so ~13s after click.
	await expect(page.getByTestId('intro-overlay')).not.toBeAttached({ timeout: 20000 });
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
});

test('frame counter advances while the film plays', async ({ page }) => {
	await gotoHydrated(page, FAST);
	await page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' }).click();
	const counter = page.getByText(/REEL 0083 \/\/ FRAME \d{3} \/ 120/);
	await counter.waitFor({ timeout: 5000 });
	const before = await counter.textContent();
	await expect(counter).not.toHaveText(before!, { timeout: 3000 });
});

test('skip from standby goes straight to the site', async ({ page }) => {
	await skipToSite(page);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(/SHIQIU/);
	await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
});

test('skip mid-film aborts the reel', async ({ page }) => {
	await gotoHydrated(page, FAST);
	await page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' }).click();
	await page.getByTestId('film-box').waitFor({ timeout: 5000 });
	await page.getByRole('button', { name: 'SKIP →' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByTestId('film-box')).not.toBeAttached();
});

test('replay returns to standby with scroll locked', async ({ page }) => {
	await skipToSite(page);
	await page.getByRole('button', { name: '▶ REPLAY LAUNCH' }).click();
	await expect(page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' })).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
});

test('?intro=off share link lands directly on the silent site', async ({ page }) => {
	await gotoHydrated(page, '/?intro=off');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByTestId('intro-overlay')).not.toBeAttached();
	await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
	await page.getByRole('button', { name: '▶ REPLAY LAUNCH' }).click();
	await expect(page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' })).toBeVisible();
});
