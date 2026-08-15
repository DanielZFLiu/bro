import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AudioEngine } from '../audio/engine';
import { FRAME_COUNT } from './film';
import {
	createLaunchSequence,
	IGNITE_MS,
	MUSIC_DROP_SEC,
	REVEAL_AT_MS,
	SITE_AT_MS,
	type Phase
} from './sequence';

const REEL_SECONDS = 57.724807;

function mockAudio(overrides: Partial<AudioEngine> = {}): AudioEngine {
	return {
		load: vi.fn(),
		reelDuration: () => null,
		playReel: () => false,
		stopReel: vi.fn(),
		startSiteMusic: vi.fn(),
		stopMusic: vi.fn(),
		toggleMuted: () => false,
		isMuted: () => false,
		playIgniteSfx: vi.fn(),
		playIgniteBeep: vi.fn(),
		playFilmStartTone: vi.fn(),
		playOutroTone: vi.fn(),
		playBeat: vi.fn(),
		dispose: vi.fn(),
		...overrides
	};
}

function harness(overrides: Partial<AudioEngine> = {}, fallbackFps?: number) {
	const audio = mockAudio(overrides);
	const phases: Phase[] = [];
	const frames: number[] = [];
	const sequence = createLaunchSequence({
		audio,
		fallbackFps,
		isFrameReady: () => true,
		onPhase: (p) => phases.push(p),
		onFrame: (i) => frames.push(i)
	});
	return { audio, phases, frames, sequence };
}

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
});

afterEach(() => {
	vi.useRealTimers();
});

describe('createLaunchSequence', () => {
	it('runs standby → ignite → film → starrise → reveal → site on the synth path', () => {
		const { audio, phases, frames, sequence } = harness({}, 24);
		expect(sequence.phase).toBe('standby');

		sequence.initiate();
		expect(sequence.phase).toBe('ignite');
		expect(audio.playIgniteSfx).toHaveBeenCalledOnce();

		vi.advanceTimersByTime(IGNITE_MS);
		expect(sequence.phase).toBe('film');
		expect(frames[0]).toBe(0);
		expect(audio.playFilmStartTone).toHaveBeenCalledOnce();

		vi.advanceTimersByTime((FRAME_COUNT / 24) * 1000 + 500);
		expect(sequence.phase).toBe('starrise');
		expect(audio.playOutroTone).toHaveBeenCalledOnce();
		expect(audio.startSiteMusic).toHaveBeenCalledWith(MUSIC_DROP_SEC, 2.5);
		expect(frames.at(-1)).toBe(FRAME_COUNT - 1);

		vi.advanceTimersByTime(REVEAL_AT_MS);
		expect(phases).toContain('reveal');
		vi.advanceTimersByTime(SITE_AT_MS - REVEAL_AT_MS);
		expect(sequence.phase).toBe('site');
	});

	it('fires synth beats for every frame crossed on the fallback path', () => {
		const { audio, sequence } = harness({}, 24);
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 2000);
		expect(audio.playBeat).toHaveBeenCalledWith(30);
	});

	it('holds the frame while its image is not yet loaded', () => {
		const audio = mockAudio();
		const frames: number[] = [];
		const sequence = createLaunchSequence({
			audio,
			fallbackFps: 24,
			isFrameReady: (i) => i === 0,
			onPhase: () => {},
			onFrame: (i) => frames.push(i)
		});
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 1000);
		expect(Math.max(...frames)).toBe(0);
		sequence.destroy();
	});

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

	it('uses the real reel duration for fps when reel audio plays', () => {
		const { audio, sequence } = harness({
			playReel: () => true,
			reelDuration: () => REEL_SECONDS
		});
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 1000);
		expect(audio.playFilmStartTone).not.toHaveBeenCalled();
		expect(audio.playBeat).not.toHaveBeenCalled();
		sequence.destroy();
	});
});
