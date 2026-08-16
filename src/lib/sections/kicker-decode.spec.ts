import { describe, expect, it } from 'vitest';
import { decodeKicker } from './kicker-decode';

// A constant source makes every unresolved slot the same glyph, so assertions read the
// resolved prefix instead of the glyph table.
const constantSource = () => 0;

describe('decodeKicker', () => {
	it('returns the target once the sweep completes or overruns', () => {
		expect(decodeKicker('PILOT REGISTRY', 1, constantSource)).toBe('PILOT REGISTRY');
		expect(decodeKicker('PILOT REGISTRY', 4, constantSource)).toBe('PILOT REGISTRY');
	});

	it('resolves left to right and scrambles the tail', () => {
		const out = decodeKicker('HONG KONG', 0.5, constantSource);

		expect(out).toHaveLength(9);
		expect(out.startsWith('HONG ')).toBe(true);
		expect(new Set(out.slice(5)).size).toBe(1);
	});

	it('keeps length and spaces while nothing has resolved', () => {
		const out = decodeKicker('HONG KONG', 0, constantSource);

		expect(out).toHaveLength(9);
		expect(out[4]).toBe(' ');
		expect(new Set(out.replace(' ', '')).size).toBe(1);
	});
});
