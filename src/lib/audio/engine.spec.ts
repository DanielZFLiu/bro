import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudioEngine } from './engine';
import {
	MUSIC_URL,
	REEL_URL,
	audioContext,
	flush,
	installWebAudioFake,
	settle,
	type FakeGain
} from './engine-harness';

const MUSIC_VOLUME = 0.5;

const loadedEngine = async () => {
	const engine = createAudioEngine({ musicVolume: MUSIC_VOLUME });
	engine.load();
	await flush();
	return engine;
};

const held = (gain: FakeGain) => gain.gain.calls.slice(-2);
const hold = (value: number) => [
	{ method: 'cancelScheduledValues', time: 0 },
	{ method: 'setValueAtTime', value, time: 0 }
];

beforeEach(installWebAudioFake);

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('toggleMuted', () => {
	it('cancels pending fades before pinning each live gain', async () => {
		const engine = await loadedEngine();
		await settle(REEL_URL, { duration: 57 });
		await settle(MUSIC_URL, { duration: 210 });
		engine.playReel();
		engine.startSiteMusic(58.2, 2.5);
		const [reel, music] = audioContext().gains;

		engine.toggleMuted();
		expect(held(reel)).toEqual(hold(0));
		expect(held(music)).toEqual(hold(0));

		engine.toggleMuted();
		// The reel stays ducked while site music holds playback; only the song comes back.
		expect(held(reel)).toEqual(hold(0));
		expect(held(music)).toEqual(hold(MUSIC_VOLUME));
	});
});

describe('startSiteMusic before a buffer lands', () => {
	it('stashes the request and starts the song once it decodes', async () => {
		const engine = await loadedEngine();
		engine.startSiteMusic(12, 0.5);
		expect(audioContext().sources).toHaveLength(0);

		await settle(REEL_URL, { duration: 57 });
		expect(audioContext().sources).toHaveLength(0);

		await settle(MUSIC_URL, { duration: 210 });
		expect(audioContext().sources.map((s) => s.startArgs)).toEqual([[0, 12]]);
		expect(audioContext().gains[0].gain.calls).toEqual([
			{ method: 'setValueAtTime', value: 0, time: 0 },
			{ method: 'linearRampToValueAtTime', value: MUSIC_VOLUME, time: 0.5 }
		]);
	});

	it('falls back to looping the reel when the song fails to decode', async () => {
		const engine = await loadedEngine();
		engine.startSiteMusic(30, 1.2);
		await settle(REEL_URL, { duration: 57 });
		await settle(MUSIC_URL, null);
		expect(audioContext().sources.map((s) => s.startArgs)).toEqual([[0, 24]]);
		expect(audioContext().sources[0].loop).toBe(true);
	});

	it('drops the stash when music is stopped before the decode lands', async () => {
		const engine = await loadedEngine();
		engine.startSiteMusic(12, 0.5);
		engine.stopMusic();
		await settle(MUSIC_URL, { duration: 210 });
		expect(audioContext().sources).toHaveLength(0);
	});

	it('stays silent when neither track decodes', async () => {
		const engine = await loadedEngine();
		await settle(REEL_URL, null);
		await settle(MUSIC_URL, null);
		engine.startSiteMusic(0, 1.2);
		await flush();
		expect(audioContext().sources).toHaveLength(0);
	});
});
