import { describe, expect, it } from 'vitest';
import { FRAME_COUNT } from './film';
import { MUSIC_DROP_SEC, musicOffsetOnSkip, reelFps } from './sequence';

describe('reelFps', () => {
	it('derives fps from the real reel duration', () => {
		// Pinned: 120 frames over the 57.72s clip. A formula change must update this.
		expect(reelFps(57.724807)).toBeCloseTo(2.08, 2);
	});

	it('clamps the synth fallback to 1-24 fps and defaults to 2.2', () => {
		expect(reelFps(null)).toBe(2.2);
		expect(reelFps(null, 24)).toBe(24);
		expect(reelFps(null, 99)).toBe(24);
		expect(reelFps(null, 0.1)).toBe(1);
	});
});

describe('musicOffsetOnSkip', () => {
	const fps = 2.2;
	const duration = FRAME_COUNT / fps;

	it('is zero from standby and site', () => {
		expect(musicOffsetOnSkip('standby', 0, fps)).toBe(0);
		expect(musicOffsetOnSkip('site', 0, fps)).toBe(0);
	});

	it('maps film progress onto the song so the beat drop stays aligned', () => {
		expect(musicOffsetOnSkip('film', 0, fps)).toBeCloseTo(MUSIC_DROP_SEC - duration, 5);
		expect(musicOffsetOnSkip('film', duration - 3, fps)).toBeCloseTo(MUSIC_DROP_SEC - 3, 5);
		expect(musicOffsetOnSkip('film', duration + 99, fps)).toBeCloseTo(MUSIC_DROP_SEC, 5);
	});

	it('clamps to zero when the reel outlasts the drop offset', () => {
		// fps 1 makes duration 120s > 58.2s, driving the raw offset negative.
		expect(musicOffsetOnSkip('film', 0, 1)).toBe(0);
	});

	it('lands on the drop from starrise and reveal', () => {
		expect(musicOffsetOnSkip('starrise', 0, fps)).toBe(MUSIC_DROP_SEC);
		expect(musicOffsetOnSkip('reveal', 0, fps)).toBe(MUSIC_DROP_SEC);
	});
});
