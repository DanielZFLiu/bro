import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRAME_COUNT } from './film';
import { harness, mockAudio } from './sequence-harness';
import { createLaunchSequence, IGNITE_MS, MUSIC_DROP_SEC, SITE_AT_MS } from './sequence';

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
});

afterEach(() => {
	vi.useRealTimers();
});

describe('launch sequence controls', () => {
	it('skip mid-film stops the reel and starts music at the mapped offset', () => {
		const { audio, sequence } = harness({}, 24);
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 2000);
		sequence.skip();
		expect(sequence.phase).toBe('site');
		expect(audio.stopReel).toHaveBeenCalled();
		const duration = FRAME_COUNT / 24;
		expect(audio.startSiteMusic).toHaveBeenLastCalledWith(
			expect.closeTo(Math.max(0, MUSIC_DROP_SEC - (duration - 2)), 1),
			1.2
		);
	});

	it('skip from standby goes straight to the site with music from the top', () => {
		const { audio, sequence } = harness({}, 24);
		sequence.skip();
		expect(sequence.phase).toBe('site');
		expect(audio.startSiteMusic).toHaveBeenCalledWith(0, 1.2);
	});

	it('skip during ignite cancels the pending film and never re-emits phases', () => {
		const { audio, phases, sequence } = harness({}, 24);
		sequence.initiate();
		vi.advanceTimersByTime(1000);
		sequence.skip();
		expect(sequence.phase).toBe('site');
		vi.advanceTimersByTime(60000);
		expect(phases).not.toContain('film');
		expect(phases.filter((p) => p === 'site')).toHaveLength(1);
		expect(audio.startSiteMusic).toHaveBeenCalledWith(0, 1.2);
	});

	it('skip during starrise cancels the reveal/site timers and lands at the drop', () => {
		const { audio, phases, sequence } = harness({}, 24);
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + (FRAME_COUNT / 24) * 1000 + 500);
		expect(sequence.phase).toBe('starrise');
		sequence.skip();
		expect(sequence.phase).toBe('site');
		expect(audio.startSiteMusic).toHaveBeenLastCalledWith(MUSIC_DROP_SEC, 1.2);
		vi.advanceTimersByTime(60000);
		expect(phases).not.toContain('reveal');
	});

	it('replay after a completed run re-arms a full second run', () => {
		const { frames, sequence } = harness({}, 24);
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + (FRAME_COUNT / 24) * 1000 + 500 + SITE_AT_MS);
		expect(sequence.phase).toBe('site');
		sequence.replay();
		expect(sequence.phase).toBe('standby');
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS);
		expect(sequence.phase).toBe('film');
		expect(frames.filter((f) => f === 0).length).toBeGreaterThanOrEqual(2);
	});

	it('replay stops audio, clears the reel, and returns to standby', () => {
		const { audio, frames, sequence } = harness({}, 24);
		sequence.skip();
		sequence.replay();
		expect(sequence.phase).toBe('standby');
		expect(audio.stopMusic).toHaveBeenCalled();
		expect(frames.at(-1)).toBe(-1);
	});

	it('starts silently at the site with startAtSite, and replay still arms the intro', () => {
		const audio = mockAudio();
		const sequence = createLaunchSequence({
			audio,
			startAtSite: true,
			isFrameReady: () => true,
			onPhase: () => {},
			onFrame: () => {}
		});
		expect(sequence.phase).toBe('site');
		expect(audio.startSiteMusic).not.toHaveBeenCalled();
		sequence.replay();
		expect(sequence.phase).toBe('standby');
	});

	it('emits nothing more once destroyed mid-run', () => {
		const { phases, frames, sequence } = harness({}, 24);
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 500);
		sequence.destroy();
		const settled = { phases: phases.length, frames: frames.length };

		vi.advanceTimersByTime(60000);
		expect(phases).toHaveLength(settled.phases);
		expect(frames).toHaveLength(settled.frames);
	});
});
