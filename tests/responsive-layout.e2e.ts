import { expect, test } from '@playwright/test';
import { FAST, gotoHydrated, skipToSite } from './journeys';

const viewports = [
	{ name: 'phone', width: 390, height: 844 },
	{ name: 'design', width: 1528, height: 883 },
	{ name: 'desktop', width: 1920, height: 1080 }
];

for (const vp of viewports) {
	test(`site has no horizontal overflow at ${vp.name}`, async ({ page }) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await skipToSite(page);
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow).toBe(0);
	});

	test(`hero name and portrait visible at ${vp.name}`, async ({ page }) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await skipToSite(page);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByRole('img', { name: 'Portrait of Bill Liu' })).toBeVisible();
	});

	test(`film box fits and fills the viewport at ${vp.name}`, async ({ page }) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await gotoHydrated(page, FAST);
		await page.getByRole('button', { name: '▶ INITIATE LAUNCH SEQUENCE' }).click();
		const box = page.getByTestId('film-box');
		await box.waitFor({ timeout: 5000 });
		const rect = (await box.boundingBox())!;
		expect(rect.width).toBeLessThanOrEqual(vp.width);
		expect(rect.height).toBeLessThanOrEqual(vp.height);
		const fill = Math.max(rect.width / vp.width, rect.height / vp.height);
		expect(fill).toBeGreaterThan(0.9);
	});
}

test('standby panel fits the phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await gotoHydrated(page, FAST);
	// The overlay is position:fixed + overflow:hidden, so document scrollWidth can never
	// catch an oversized panel; measure the panel's own box instead.
	const rect = (await page.getByTestId('standby-panel').boundingBox())!;
	expect(rect.width).toBeLessThanOrEqual(390);
	expect(rect.height).toBeLessThanOrEqual(844);
});
