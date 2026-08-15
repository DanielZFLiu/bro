import { expect, type Page } from '@playwright/test';

export const FAST = '/?fps=24';

// Prerendered HTML paints before hydration; click only after the mount signal appears.
export async function gotoHydrated(page: Page, url: string): Promise<void> {
	await page.goto(url);
	await page.locator('[data-hydrated="true"]').waitFor();
}

export async function skipToSite(page: Page): Promise<void> {
	await gotoHydrated(page, FAST);
	await page.getByRole('button', { name: 'SKIP INTRO →' }).click();
	await expect(page.getByTestId('intro-overlay')).not.toBeAttached();
}
