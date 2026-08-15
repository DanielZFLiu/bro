import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from './Hero.svelte';
import { hero } from '../profile';

describe('Hero.svelte', () => {
	it('renders the pilot name, kicker, and chips from profile data', async () => {
		render(Hero, { introDone: false });

		// The <br> between name lines means textContent has no space there; assert per line.
		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toHaveTextContent('SHIQIU');
		await expect.element(heading).toHaveTextContent('(BILL) LIU');
		await expect.element(page.getByText('PILOT REGISTRY')).toBeInTheDocument();
		for (const chip of hero.chips) {
			await expect.element(page.getByText(chip)).toBeInTheDocument();
		}
	});

	it('keeps the scroll cue hidden until the intro is done', async () => {
		render(Hero, { introDone: false });

		// The cue hides via visibility (not just opacity) so visibility checks see it.
		await expect.element(page.getByText('▼ SCROLL FOR MISSION LOG')).not.toBeVisible();
	});

	it('reveals the scroll cue after the arming delay once the intro is done', async () => {
		render(Hero, { introDone: true });

		const cue = page.getByText('▼ SCROLL FOR MISSION LOG');
		await expect.element(cue).not.toBeVisible();
		// Real timers: the poll has to outlast the component's 2.8s arming delay.
		await expect.element(cue, { timeout: 6000 }).toBeVisible();
	});
});
