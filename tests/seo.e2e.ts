import { expect, test } from '@playwright/test';
import { gotoHydrated } from './journeys';

const CANONICAL = 'https://bill-liu.com/';

test('share link declares the canonical URL and an absolute card image', async ({ page }) => {
	await gotoHydrated(page, '/?intro=off');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', CANONICAL);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		`${CANONICAL}og.png`
	);
});

test('share link carries a person schema naming the pilot', async ({ page }) => {
	await gotoHydrated(page, '/?intro=off');
	const block = page.locator('script[type="application/ld+json"]');
	const person = JSON.parse((await block.textContent())!);
	expect(person['@type']).toBe('Person');
	expect(person.name).toBe('Shiqiu Liu');
	expect(person.sameAs).toContain('https://www.linkedin.com/in/shiqiu-bill-liu');
});

test('sitemap lists the canonical URL', async ({ request }) => {
	const sitemap = await request.get('/sitemap.xml');
	expect(sitemap.status()).toBe(200);
	expect(await sitemap.text()).toContain(CANONICAL);
});

test('open graph card is served as a png', async ({ request }) => {
	const card = await request.get('/og.png');
	expect(card.status()).toBe(200);
	expect(card.headers()['content-type']).toContain('image/png');
});
