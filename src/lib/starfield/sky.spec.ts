import { describe, it, expect } from 'vitest';
import { createStarData, mulberry32 } from './sky';

describe('mulberry32', () => {
	it('is deterministic for a given seed and stays in [0, 1)', () => {
		const a = mulberry32(83);
		const b = mulberry32(83);
		const seqA = Array.from({ length: 50 }, a);
		const seqB = Array.from({ length: 50 }, b);
		expect(seqA).toEqual(seqB);
		for (const v of seqA) {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
});

describe('createStarData', () => {
	it('is deterministic for identical dimensions', () => {
		expect(createStarData(1528, 883)).toEqual(createStarData(1528, 883));
	});

	it('draws the default sky from seed 83 and honours an explicit seed', () => {
		// Pinned value: a change to the default seed or to the generator must be deliberate.
		expect(createStarData(390, 844).stars[0].x).toBeCloseTo(109.94930858490989, 6);
		expect(createStarData(390, 844, 84)).not.toEqual(createStarData(390, 844));
	});

	it('scales star count with area and always makes 6 nebula blobs', () => {
		const small = createStarData(390, 844);
		const large = createStarData(1920, 1080);
		// Pinned values: a density change must consciously update these.
		expect(small.stars.length).toBe(173);
		expect(large.stars.length).toBe(1091);
		expect(small.blobs.length).toBe(6);
	});

	it('keeps every star inside the canvas with a valid depth layer', () => {
		const { stars } = createStarData(1000, 700);
		for (const s of stars) {
			expect(s.x).toBeGreaterThanOrEqual(0);
			expect(s.x).toBeLessThanOrEqual(1000);
			expect(s.y).toBeGreaterThanOrEqual(0);
			expect(s.y).toBeLessThanOrEqual(700);
			expect([0, 1, 2]).toContain(s.layer);
		}
	});

	it('marks only a small fraction of stars as glowing', () => {
		const { stars } = createStarData(1920, 1080);
		const glow = stars.filter((s) => s.glow).length / stars.length;
		expect(glow).toBeGreaterThan(0.005);
		expect(glow).toBeLessThan(0.05);
	});

	it('only flares stars that also glow', () => {
		// The renderer reaches its flare branch only inside the glow branch. The `some` guard
		// stops `every` from passing on a dataset that happens to hold no flares at all.
		const { stars } = createStarData(1920, 1080);
		expect(stars.some((s) => s.flare)).toBe(true);
		expect(stars.every((s) => !s.flare || s.glow)).toBe(true);
	});

	it('zeroes the fields that belong to flags a star does not carry', () => {
		const { stars } = createStarData(1920, 1080);
		for (const s of stars) {
			if (!s.flare) expect(s.flareSize).toBe(0);
			if (!s.glow) expect(s.twinkleSpeed).toBe(0);
			expect(s.riseThreshold).toBeGreaterThanOrEqual(0);
			expect(s.riseThreshold).toBeLessThan(1);
		}
	});
});
