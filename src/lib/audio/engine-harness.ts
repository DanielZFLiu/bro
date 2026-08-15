// Test support for the engine spec: a Web Audio fake that records gain scheduling and leaves
// the test in control of when each decode lands.

import { vi } from 'vitest';

export const REEL_URL = '/audio/reel.m4a';
export const MUSIC_URL = '/audio/paradise.m4a';

export interface ParamCall {
	method: string;
	value?: number;
	time: number;
}

export class FakeParam {
	value = 0;
	calls: ParamCall[] = [];
	setValueAtTime(value: number, time: number) {
		this.calls.push({ method: 'setValueAtTime', value, time });
		this.value = value;
	}
	linearRampToValueAtTime(value: number, time: number) {
		this.calls.push({ method: 'linearRampToValueAtTime', value, time });
	}
	cancelScheduledValues(time: number) {
		this.calls.push({ method: 'cancelScheduledValues', time });
	}
}

export class FakeGain {
	gain = new FakeParam();
	connect<T>(node: T): T {
		return node;
	}
}

export class FakeSource {
	loop = false;
	startArgs: number[] = [];
	connect<T>(node: T): T {
		return node;
	}
	start(...args: number[]) {
		this.startArgs = args;
	}
	stop() {}
}

const contexts: FakeContext[] = [];
const decodes = new Map<
	string,
	{ resolve: (buf: { duration: number }) => void; reject: () => void }
>();

class FakeContext {
	state = 'running';
	currentTime = 0;
	gains: FakeGain[] = [];
	sources: FakeSource[] = [];
	constructor() {
		contexts.push(this);
	}
	createGain() {
		const gain = new FakeGain();
		this.gains.push(gain);
		return gain;
	}
	createBufferSource() {
		const source = new FakeSource();
		this.sources.push(source);
		return source;
	}
	decodeAudioData(data: { url: string }) {
		return new Promise<{ duration: number }>((resolve, reject) => {
			decodes.set(data.url, { resolve, reject });
		});
	}
	resume() {}
	close() {}
}

export function installWebAudioFake(): void {
	contexts.length = 0;
	decodes.clear();
	vi.stubGlobal('AudioContext', FakeContext);
	vi.stubGlobal('fetch', (url: string) =>
		Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve({ url }) })
	);
}

// The engine builds its context lazily, so tests read it back only after load().
export const audioContext = () => contexts[0];

export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

export async function settle(url: string, buffer: { duration: number } | null): Promise<void> {
	const decode = decodes.get(url)!;
	if (buffer) decode.resolve(buffer);
	else decode.reject();
	await flush();
}
