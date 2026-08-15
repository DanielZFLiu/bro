import { afterEach, describe, it, expect, vi } from 'vitest';
import { FRAME_COUNT, cuesFor, frameUrl, preloadFrames, type FilmCues } from './film';

describe('frameUrl', () => {
	it('zero-pads to four digits across the reel', () => {
		expect(frameUrl(0)).toBe('/manga/frame_0000.webp');
		expect(frameUrl(7)).toBe('/manga/frame_0007.webp');
		expect(frameUrl(FRAME_COUNT - 1)).toBe('/manga/frame_0119.webp');
	});
});

describe('cuesFor', () => {
	// Window boundaries from the prototype: each entry is [frame, cue, active].
	const boundaries: Array<[number, keyof FilmCues, boolean]> = [
		[0, 'beep', false],
		[1, 'beep', true],
		[16, 'beep', true],
		[17, 'beep', false],
		[29, 'rumble', false],
		[30, 'rumble', true],
		[42, 'rumble', true],
		[43, 'rumble', false],
		[29, 'shake', false],
		[30, 'shake', true],
		[40, 'shake', true],
		[41, 'shake', false],
		[44, 'pilot', false],
		[45, 'pilot', true],
		[50, 'pilot', true],
		[51, 'pilot', false],
		[59, 'line', false],
		[60, 'line', true],
		[70, 'line', true],
		[71, 'line', false],
		[75, 'warn', false],
		[76, 'warn', true],
		[87, 'warn', true],
		[88, 'warn', false],
		[89, 'boom', false],
		[90, 'boom', true],
		[97, 'boom', true],
		[98, 'boom', false]
	];

	it('activates each SFX exactly inside its frame window', () => {
		for (const [frame, cue, active] of boundaries) {
			expect(cuesFor(frame)[cue], `frame ${frame} ${cue}`).toBe(active);
		}
	});

	it('shows no cues on the final frames', () => {
		expect(Object.values(cuesFor(FRAME_COUNT - 1)).some(Boolean)).toBe(false);
	});
});

describe('preloadFrames', () => {
	const created: Array<{ src: string; onload?: () => void; onerror?: () => void }> = [];

	class FakeImage {
		src = '';
		constructor() {
			created.push(this);
		}
	}

	afterEach(() => {
		created.length = 0;
		vi.unstubAllGlobals();
	});

	it('reaches full progress when some frames fail to load', () => {
		vi.stubGlobal('Image', FakeImage);
		const progress: number[] = [];
		const images = preloadFrames((n) => progress.push(n));

		expect(images).toHaveLength(FRAME_COUNT);
		expect(created).toHaveLength(FRAME_COUNT);
		created.forEach((img, i) => (i % 17 === 0 ? img.onerror?.() : img.onload?.()));

		const cadence = Array.from({ length: FRAME_COUNT / 12 }, (_, i) => (i + 1) * 12);
		expect(progress).toEqual(cadence);
		expect(progress.at(-1)).toBe(FRAME_COUNT);
	});
});
