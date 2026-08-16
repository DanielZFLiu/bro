import type { AudioEngine } from '../audio/engine';
import { FRAME_COUNT } from './film';

export type Phase = 'standby' | 'ignite' | 'film' | 'starrise' | 'reveal' | 'site';

// The site track's beat drop; every path into 'site' aligns music playback to it.
export const MUSIC_DROP_SEC = 58.2;
export const IGNITE_BEEP_MS = 1000;
export const IGNITE_MS = 2000;
export const REVEAL_AT_MS = 3200;
export const SITE_AT_MS = 4400;
const MUSIC_PRESTART_SEC = 3;

export function reelFps(audioDurationSec: number | null, fallbackFps = 2.2): number {
	if (audioDurationSec) return FRAME_COUNT / audioDurationSec;
	return Math.max(1, Math.min(24, fallbackFps));
}

export function musicOffsetOnSkip(phase: Phase, elapsedSec: number, fps: number): number {
	if (phase === 'film') {
		const duration = FRAME_COUNT / fps;
		return Math.max(0, MUSIC_DROP_SEC - (duration - Math.min(elapsedSec, duration)));
	}
	if (phase === 'starrise' || phase === 'reveal') return MUSIC_DROP_SEC;
	return 0;
}

export interface SequenceDeps {
	audio: AudioEngine;
	fallbackFps?: number;
	startAtSite?: boolean; // ?intro=off share link: begin at 'site', silent
	isFrameReady(i: number): boolean;
	onPhase(phase: Phase): void;
	onFrame(i: number): void; // -1 clears the reel
}

export interface LaunchSequence {
	readonly phase: Phase;
	initiate(): void;
	skip(): void;
	replay(): void;
	destroy(): void;
}

export function createLaunchSequence(deps: SequenceDeps): LaunchSequence {
	let phase: Phase = deps.startAtSite ? 'site' : 'standby';
	let frame = -1;
	let timers: ReturnType<typeof setTimeout>[] = [];
	let filmStart = 0;
	let fps = 0;
	let usingReel = false;
	let musicStarted = false;

	const sch = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
	const clearTimers = () => {
		timers.forEach(clearTimeout);
		timers = [];
	};
	const setPhase = (p: Phase) => {
		phase = p;
		deps.onPhase(p);
	};
	const setFrame = (i: number) => {
		frame = i;
		deps.onFrame(i);
	};

	const beginFilm = () => {
		setPhase('film');
		setFrame(0);
		filmStart = performance.now();
		usingReel = deps.audio.playReel();
		fps = reelFps(usingReel ? deps.audio.reelDuration() : null, deps.fallbackFps);
		musicStarted = false;
		if (!usingReel) deps.audio.playFilmStartTone();
		step();
	};

	const step = () => {
		sch(
			() => {
				if (phase !== 'film') return;
				const elapsed = (performance.now() - filmStart) / 1000;
				const next = Math.min(FRAME_COUNT, Math.floor(elapsed * fps));
				if (next >= FRAME_COUNT) return outro();
				if (next > frame && deps.isFrameReady(next)) {
					if (!usingReel) for (let k = frame + 1; k <= next; k++) deps.audio.playBeat(k);
					setFrame(next);
				}
				const duration = FRAME_COUNT / fps;
				if (usingReel && !musicStarted && elapsed >= duration - MUSIC_PRESTART_SEC) {
					musicStarted = true;
					deps.audio.startSiteMusic(musicOffsetOnSkip('film', elapsed, fps), 3);
				}
				step();
			},
			Math.min(120, 500 / fps)
		);
	};

	const outro = () => {
		setFrame(FRAME_COUNT - 1);
		setPhase('starrise');
		deps.audio.startSiteMusic(MUSIC_DROP_SEC, 2.5);
		if (!usingReel) deps.audio.playOutroTone();
		sch(() => setPhase('reveal'), REVEAL_AT_MS);
		sch(() => setPhase('site'), SITE_AT_MS);
	};

	return {
		get phase() {
			return phase;
		},

		initiate() {
			if (phase !== 'standby') return;
			setPhase('ignite');
			deps.audio.playIgniteSfx();
			sch(() => deps.audio.playIgniteBeep(), IGNITE_BEEP_MS);
			sch(beginFilm, IGNITE_MS);
		},

		skip() {
			if (phase === 'site') return;
			const elapsed = phase === 'film' ? (performance.now() - filmStart) / 1000 : 0;
			const offset = musicOffsetOnSkip(phase, elapsed, fps);
			clearTimers();
			deps.audio.stopReel();
			setFrame(-1);
			setPhase('site');
			deps.audio.startSiteMusic(offset, 1.2);
		},

		replay() {
			clearTimers();
			deps.audio.stopReel();
			deps.audio.stopMusic();
			setFrame(-1);
			setPhase('standby');
		},

		destroy() {
			clearTimers();
		}
	};
}
