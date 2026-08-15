// Test support for the sequence specs: an AudioEngine of spies plus a wired-up LaunchSequence.

import { vi } from 'vitest';
import type { AudioEngine } from '../audio/engine';
import { createLaunchSequence, type Phase } from './sequence';

export function mockAudio(overrides: Partial<AudioEngine> = {}): AudioEngine {
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

export function harness(overrides: Partial<AudioEngine> = {}, fallbackFps?: number) {
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
