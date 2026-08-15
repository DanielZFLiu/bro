const REEL_URL = '/audio/reel.m4a';
const MUSIC_URL = '/audio/paradise.m4a';

export interface AudioEngine {
	load(): void;
	reelDuration(): number | null;
	playReel(): boolean;
	stopReel(): void;
	startSiteMusic(offsetSec: number, fadeSec: number): void;
	stopMusic(): void;
	toggleMuted(): boolean;
	isMuted(): boolean;
	playIgniteSfx(): void;
	playIgniteBeep(): void;
	playFilmStartTone(): void;
	playOutroTone(): void;
	playBeat(frame: number): void;
	dispose(): void;
}

export function createAudioEngine(
	opts: { musicVolume?: number; reelEnabled?: boolean } = {}
): AudioEngine {
	const musicVolume = opts.musicVolume ?? 0.35;
	const reelEnabled = opts.reelEnabled ?? true;
	let ctx: AudioContext | null = null;
	let reelBuf: AudioBuffer | null = null;
	let musicBuf: AudioBuffer | null = null;
	let reelSrc: AudioBufferSourceNode | null = null;
	let reelGain: GainNode | null = null;
	let musicSrc: AudioBufferSourceNode | null = null;
	let musicGain: GainNode | null = null;
	let muted = false;

	const ac = (): AudioContext | null => {
		try {
			ctx ??= new AudioContext();
			if (ctx.state === 'suspended') void ctx.resume();
			return ctx;
		} catch {
			return null;
		}
	};

	const decode = async (url: string): Promise<AudioBuffer | null> => {
		try {
			const res = await fetch(url);
			if (!res.ok) return null;
			const a = ac();
			if (!a) return null;
			return await a.decodeAudioData(await res.arrayBuffer());
		} catch {
			return null;
		}
	};

	const tone = (f0: number, f1: number, dur: number, type: OscillatorType, g0: number) => {
		const a = ac();
		if (!a || muted) return;
		const osc = a.createOscillator();
		const gain = a.createGain();
		const t = a.currentTime;
		osc.type = type;
		osc.frequency.setValueAtTime(f0, t);
		if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
		gain.gain.setValueAtTime(g0, t);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
		osc.connect(gain).connect(a.destination);
		osc.start(t);
		osc.stop(t + dur + 0.05);
	};

	const noise = (dur: number, freq: number, g0: number) => {
		const a = ac();
		if (!a || muted) return;
		const n = Math.floor(a.sampleRate * dur);
		const buffer = a.createBuffer(1, n, a.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
		const src = a.createBufferSource();
		src.buffer = buffer;
		const filter = a.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.value = freq;
		const gain = a.createGain();
		const t = a.currentTime;
		gain.gain.setValueAtTime(g0, t);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
		src.connect(filter);
		filter.connect(gain);
		gain.connect(a.destination);
		src.start(t);
	};

	return {
		load() {
			void decode(REEL_URL).then((b) => (reelBuf = b));
			void decode(MUSIC_URL).then((b) => (musicBuf = b));
		},

		reelDuration: () => reelBuf?.duration ?? null,

		playReel() {
			this.stopReel();
			const a = ac();
			if (!a || !reelBuf || !reelEnabled) return false;
			const src = a.createBufferSource();
			src.buffer = reelBuf;
			const gain = a.createGain();
			gain.gain.value = muted ? 0 : 1;
			src.connect(gain).connect(a.destination);
			src.start();
			reelSrc = src;
			reelGain = gain;
			return true;
		},

		stopReel() {
			try {
				reelSrc?.stop();
			} catch {
				// already stopped
			}
			reelSrc = null;
			reelGain = null;
		},

		startSiteMusic(offsetSec, fadeSec) {
			if (musicSrc) return;
			const a = ac();
			if (!a) return;
			const buf = musicBuf ?? reelBuf;
			if (!buf) return;
			const src = a.createBufferSource();
			src.buffer = buf;
			let startAt: number;
			if (musicBuf) {
				startAt = Math.max(0, Math.min(offsetSec, buf.duration - 1));
			} else {
				// No song decoded: loop the reel's calm mid-section as ambience instead.
				src.loop = true;
				src.loopStart = 24;
				src.loopEnd = Math.min(52, buf.duration - 1);
				startAt = 24;
			}
			src.onended = () => {
				if (musicSrc === src) {
					musicSrc = null;
					musicGain = null;
				}
			};
			const gain = a.createGain();
			gain.gain.setValueAtTime(0, a.currentTime);
			gain.gain.linearRampToValueAtTime(muted ? 0 : musicVolume, a.currentTime + fadeSec);
			src.connect(gain).connect(a.destination);
			src.start(0, startAt);
			musicSrc = src;
			musicGain = gain;
			if (reelGain) {
				reelGain.gain.setValueAtTime(reelGain.gain.value, a.currentTime);
				reelGain.gain.linearRampToValueAtTime(0, a.currentTime + 2.5);
			}
		},

		stopMusic() {
			try {
				musicSrc?.stop();
			} catch {
				// already stopped
			}
			musicSrc = null;
			musicGain = null;
		},

		toggleMuted() {
			muted = !muted;
			if (reelGain) reelGain.gain.value = muted ? 0 : 1;
			if (musicGain) musicGain.gain.value = muted ? 0 : musicVolume;
			return muted;
		},

		isMuted: () => muted,

		playIgniteSfx() {
			noise(1.9, 750, 0.045);
			tone(150, 0, 0.05, 'triangle', 0.1);
			noise(0.06, 2500, 0.12);
		},

		playIgniteBeep() {
			tone(150, 0, 0.05, 'triangle', 0.1);
			noise(0.06, 2500, 0.12);
		},

		playFilmStartTone() {
			tone(880, 0, 0.07, 'square', 0.05);
		},

		playOutroTone() {
			tone(52, 30, 2.4, 'sine', 0.08);
		},

		// Synth stand-ins fired per frame when the real reel audio is unavailable.
		playBeat(frame) {
			if (frame === 6 || frame === 14 || frame === 20)
				tone(980 + frame * 12, 0, 0.07, 'square', 0.04);
			else if (frame === 22) tone(1500, 0, 0.3, 'sine', 0.05);
			else if (frame === 30) {
				noise(3.2, 150, 0.26);
				tone(68, 42, 2.8, 'sawtooth', 0.05);
			} else if (frame === 40) noise(2.4, 180, 0.16);
			else if (frame === 45) tone(210, 0, 0.9, 'sine', 0.035);
			else if (frame === 52 || frame === 58 || frame === 78 || frame === 84) {
				tone(640, 0, 0.15, 'square', 0.05);
				setTimeout(() => tone(470, 0, 0.15, 'square', 0.05), 190);
			} else if (frame === 62) {
				tone(300, 90, 0.5, 'sawtooth', 0.09);
				noise(0.5, 900, 0.12);
			} else if (frame === 72) tone(180, 60, 0.25, 'square', 0.06);
			else if (frame === 88) {
				noise(1.8, 3800, 0.35);
				tone(110, 1050, 1.2, 'sawtooth', 0.08);
			} else if (frame === 94) noise(2.4, 2200, 0.22);
			else if (frame === 104) tone(48, 30, 3, 'sine', 0.08);
			else if (frame === 112) tone(1800, 0, 0.4, 'sine', 0.02);
		},

		dispose() {
			this.stopReel();
			this.stopMusic();
			void ctx?.close();
			ctx = null;
		}
	};
}
