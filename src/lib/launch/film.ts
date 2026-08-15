export const FRAME_COUNT = 120;

export function frameUrl(i: number): string {
	return `/manga/frame_${String(i).padStart(4, '0')}.webp`;
}

export interface FilmCues {
	beep: boolean;
	rumble: boolean;
	shake: boolean;
	pilot: boolean;
	line: boolean;
	warn: boolean;
	boom: boolean;
}

// SFX windows are frame indices synced by eye to the reel during the design pass.
const WINDOWS: Record<keyof FilmCues, [number, number]> = {
	beep: [1, 16],
	rumble: [30, 42],
	shake: [30, 40],
	pilot: [45, 50],
	line: [60, 70],
	warn: [76, 87],
	boom: [90, 97]
};

export function cuesFor(frame: number): FilmCues {
	const active = ([from, to]: [number, number]) => frame >= from && frame <= to;
	return {
		beep: active(WINDOWS.beep),
		rumble: active(WINDOWS.rumble),
		shake: active(WINDOWS.shake),
		pilot: active(WINDOWS.pilot),
		line: active(WINDOWS.line),
		warn: active(WINDOWS.warn),
		boom: active(WINDOWS.boom)
	};
}

export function preloadFrames(onProgress: (loaded: number) => void): HTMLImageElement[] {
	let loaded = 0;
	return Array.from({ length: FRAME_COUNT }, (_, i) => {
		const img = new Image();
		img.src = frameUrl(i);
		img.onload = () => {
			loaded++;
			if (loaded % 12 === 0 || loaded === FRAME_COUNT) onProgress(loaded);
		};
		return img;
	});
}

export function drawFrame(canvas: HTMLCanvasElement, img: HTMLImageElement): void {
	if (!img.complete || !img.naturalWidth) return;
	if (canvas.width !== img.naturalWidth) {
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
	}
	canvas.getContext('2d')!.drawImage(img, 0, 0);
}
