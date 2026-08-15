import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRAME_COUNT } from './film';
import { harness, mockAudio } from './sequence-harness';
import {
	createLaunchSequence,
	IGNITE_MS,
	MUSIC_DROP_SEC,
	REVEAL_AT_MS,
	SITE_AT_MS
} from './sequence';

const REEL_SECONDS = 57.724807;

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
});

afterEach(() => {
	vi.useRealTimers();
});

describe('launch sequence phases', () => {
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

	it('holds on a frame whose image has not arrived, then resumes once it does', () => {
		const frames: number[] = [];
		let ready = false;
		const sequence = createLaunchSequence({
			audio: mockAudio(),
			fallbackFps: 24,
			isFrameReady: () => ready,
			onPhase: () => {},
			onFrame: (i) => frames.push(i)
		});
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 1000);
		expect(frames).toEqual([0]);

		ready = true;
		vi.advanceTimersByTime(25);
		expect(frames.length).toBeGreaterThan(1);
		expect(frames[1]).toBeGreaterThanOrEqual(20);
		sequence.destroy();
	});

	it('fires a synth beat for every frame crossed while the reel was held', () => {
		const audio = mockAudio();
		let ready = false;
		const sequence = createLaunchSequence({
			audio,
			fallbackFps: 24,
			isFrameReady: () => ready,
			onPhase: () => {},
			onFrame: () => {}
		});
		sequence.initiate();
		vi.advanceTimersByTime(IGNITE_MS + 1000);
		expect(audio.playBeat).not.toHaveBeenCalled();

		ready = true;
		vi.advanceTimersByTime(25);
		const beats = vi.mocked(audio.playBeat).mock.calls.map(([frame]) => frame);
		expect(beats.length).toBeGreaterThanOrEqual(20);
		expect(beats).toEqual(Array.from({ length: beats.length }, (_, i) => i + 1));
		sequence.destroy();
	});

	it('uses the real reel duration for fps and skips the synth cues', () => {
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

	it('prestarts the site music once, before the real reel runs out', () => {
		const { audio, sequence } = harness({
			playReel: () => true,
			reelDuration: () => REEL_SECONDS
		});
		sequence.initiate();
		// First 120ms film tick past the prestart boundary (reel end minus three seconds).
		const elapsedSec = 54.84;
		vi.advanceTimersByTime(IGNITE_MS + elapsedSec * 1000);
		expect(audio.startSiteMusic).toHaveBeenNthCalledWith(
			1,
			expect.closeTo(MUSIC_DROP_SEC - (REEL_SECONDS - elapsedSec), 2),
			3
		);

		vi.advanceTimersByTime(1000);
		expect(audio.startSiteMusic).toHaveBeenCalledOnce();
		sequence.destroy();
	});
});
