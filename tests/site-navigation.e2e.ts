import { expect, test } from '@playwright/test';
import { FAST, gotoHydrated, skipToSite } from './journeys';

test('header anchors scroll their sections into view', async ({ page }) => {
	await skipToSite(page);
	// Scoped to the header: the section rail carries the same labels on the right edge.
	const header = page.getByRole('banner');
	await header.getByRole('link', { name: 'MISSION LOG' }).click();
	await expect(page.getByRole('heading', { name: 'Experience' })).toBeInViewport();
	await header.getByRole('link', { name: 'COMMS', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Open a channel' })).toBeInViewport();
});

test('section rail marks the section the reader is on', async ({ page }) => {
	await page.setViewportSize({ width: 1528, height: 883 });
	await skipToSite(page);
	const rail = page.getByRole('navigation', { name: 'Section index' });
	const certs = rail.getByRole('link', { name: /CERTS/ });
	await expect(rail.getByRole('link', { name: /MISSION LOG/ })).toHaveAttribute(
		'aria-current',
		'location'
	);

	await certs.click();
	await expect(page.getByRole('heading', { name: 'Certifications' })).toBeInViewport();
	await expect(certs).toHaveAttribute('aria-current', 'location');
});

test('section rail stays hidden on the phone viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await skipToSite(page);
	await expect(page.getByRole('navigation', { name: 'Section index' })).toBeHidden();
});

test('contact links carry correct targets', async ({ page }) => {
	await skipToSite(page);
	const email = page.getByRole('link', { name: /SHIQIULIU1997@GMAIL\.COM/ });
	await expect(email).toHaveAttribute('href', 'mailto:shiqiuliu1997@gmail.com');
	const linkedin = page.getByRole('link', { name: 'LINKEDIN ↗' });
	await expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/shiqiu-bill-liu');
	await expect(linkedin).toHaveAttribute('target', '_blank');
});

test('footer status line sits at the page bottom', async ({ page }) => {
	await skipToSite(page);
	await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
	await expect(page.getByText('SHIQIU LIU · 2026 // ALL SYSTEMS GREEN')).toBeVisible();
});

test('scroll cue latches off after one real scroll gesture', async ({ page }) => {
	await skipToSite(page);
	const cue = page.getByText('▼ SCROLL FOR MISSION LOG');
	await expect(cue).toBeVisible({ timeout: 8000 });
	const { width, height } = page.viewportSize()!;
	await page.mouse.move(width / 2, height / 2);
	await page.mouse.wheel(0, 400);
	await expect(cue).toBeHidden();
	await page.mouse.wheel(0, -800);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
	await expect(cue).toBeHidden();
});

test('standby SND toggle flips its label', async ({ page }) => {
	await gotoHydrated(page, FAST);
	// Scoped to the overlay: the site header underneath renders a second SND button.
	const toggle = page.getByTestId('intro-overlay').getByRole('button', { name: /SND: (ON|OFF)/ });
	await expect(toggle).toHaveText('SND: ON');
	await toggle.click();
	await expect(toggle).toHaveText('SND: OFF');
	await toggle.click();
	await expect(toggle).toHaveText('SND: ON');
});

test('header SND toggle flips after skipping to the site', async ({ page }) => {
	await skipToSite(page);
	const toggle = page.getByRole('button', { name: /SND: (ON|OFF)/ });
	await toggle.click();
	await expect(toggle).toHaveText('SND: OFF');
});
