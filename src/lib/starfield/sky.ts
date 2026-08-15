// ── Star data (pure, node-safe) ─────────────────────────

export function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export interface Star {
	x: number;
	y: number;
	layer: 0 | 1 | 2;
	radius: number;
	glow: boolean;
	flare: boolean;
	color: string;
	flareSize: number;
	alpha: number;
	riseThreshold: number;
	twinkleSpeed: number;
	twinklePhase: number;
}

export interface NebulaBlob {
	x: number;
	y: number;
	r: number;
	a: number;
}

export interface StarData {
	w: number;
	h: number;
	stars: Star[];
	blobs: NebulaBlob[];
}

// Seed 83 reproduces the sky the design was approved on.
export function createStarData(w: number, h: number, seed = 83): StarData {
	const rnd = mulberry32(seed);
	const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
	const m = Math.min(w, h);
	const blobs: NebulaBlob[] = [];
	for (let i = 0; i < 6; i++) {
		const t = 0.1 + 0.8 * rnd();
		blobs.push({
			x: w * (0.06 + 0.88 * t) + gauss() * w * 0.05,
			y: h * (0.9 - 0.78 * t) + gauss() * h * 0.06,
			r: m * (0.16 + 0.22 * rnd()),
			a: 0.022 + 0.028 * rnd()
		});
	}
	const stars: Star[] = [];
	const count = Math.round((w * h) / 1900);
	for (let i = 0; i < count; i++) {
		const u = rnd();
		let x: number, y: number;
		if (u < 0.52) {
			x = rnd() * w;
			y = rnd() * h;
		} else {
			// Second population clusters along a diagonal band (the milky-way streak).
			const t = rnd();
			x = w * (0.04 + 0.92 * t) + gauss() * m * 0.2;
			y = h * (0.9 - 0.78 * t) + gauss() * m * 0.2;
		}
		if (x < 0 || x > w || y < 0 || y > h) {
			x = rnd() * w;
			y = rnd() * h;
		}
		const depth = rnd();
		const layer = (depth < 0.55 ? 0 : depth < 0.85 ? 1 : 2) as 0 | 1 | 2;
		const p = rnd();
		const glow = p > 0.982;
		const flare = p > 0.9955;
		const radius = glow ? 0.9 + rnd() * 1.1 : 0.3 + 0.9 * Math.pow(rnd(), 2.2);
		const c = rnd();
		const color = c > 0.92 ? '#ffe3c0' : c > 0.72 ? '#cfe0ff' : '#ffffff';
		stars.push({
			x,
			y,
			layer,
			radius,
			glow,
			flare,
			color,
			flareSize: flare ? m * (0.008 + 0.012 * rnd()) : 0,
			alpha: 0.22 + 0.7 * rnd(),
			riseThreshold: rnd(),
			twinkleSpeed: glow ? 0.4 + rnd() * 1.1 : 0,
			twinklePhase: rnd() * 6.28
		});
	}
	return { w, h, stars, blobs };
}

// ── Canvas renderer ─────────────────────────────────────

const SCROLL_FACTORS = [0.04, 0.08, 0.16, 0.3];
const DRIFT_SPEEDS = [0.3, 0.6, 1.1, 1.9];

export interface SkyRenderer {
	render(nowMs: number, scrollY: number): void;
	renderRise(nowMs: number, progress: number, scrollY: number, bg: string): void;
	invalidate(): void;
}

export function createSkyRenderer(canvas: HTMLCanvasElement): SkyRenderer {
	let data: StarData | null = null;
	let layers: HTMLCanvasElement[] | null = null;
	let liveStars: Star[] = [];

	const dpr = () => Math.min(2, window.devicePixelRatio || 1);

	const drawStar = (
		ctx: CanvasRenderingContext2D,
		s: Star,
		px: number,
		py: number,
		k: number
	) => {
		if (!s.glow) {
			ctx.fillStyle = s.color;
			ctx.fillRect(px, py, s.radius * 1.7 * k, s.radius * 1.7 * k);
			return;
		}
		const glowRadius = s.radius * 4.5 * k;
		const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
		gradient.addColorStop(0, s.color);
		gradient.addColorStop(0.3, s.color);
		gradient.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(px, py, glowRadius, 0, 6.284);
		ctx.fill();
		if (s.flare) {
			const arm = s.flareSize * k;
			ctx.strokeStyle = s.color;
			ctx.lineCap = 'round';
			ctx.lineWidth = Math.max(0.8, s.radius * 0.5 * k);
			ctx.beginPath();
			ctx.moveTo(px - arm, py);
			ctx.lineTo(px + arm, py);
			ctx.moveTo(px, py - arm);
			ctx.lineTo(px, py + arm);
			ctx.stroke();
		}
	};

	const syncSize = () => {
		const k = dpr();
		const w = window.innerWidth;
		const h = window.innerHeight;
		if (canvas.width !== Math.round(w * k) || canvas.height !== Math.round(h * k)) {
			canvas.width = Math.round(w * k);
			canvas.height = Math.round(h * k);
			data = null;
			layers = null;
		}
		if (!data) data = createStarData(w, h);
	};

	const buildLayers = () => {
		if (!data) return;
		const k = dpr();
		const w = canvas.width;
		const h = canvas.height;
		const make = () => {
			const c = document.createElement('canvas');
			c.width = w;
			c.height = h;
			return c;
		};
		const nebula = make();
		const nctx = nebula.getContext('2d')!;
		for (const b of data.blobs) {
			const gradient = nctx.createRadialGradient(
				b.x * k,
				b.y * k,
				0,
				b.x * k,
				b.y * k,
				b.r * k
			);
			gradient.addColorStop(0, `rgba(175,200,255,${b.a.toFixed(3)})`);
			gradient.addColorStop(1, 'rgba(175,200,255,0)');
			nctx.fillStyle = gradient;
			nctx.fillRect((b.x - b.r) * k, (b.y - b.r) * k, b.r * 2 * k, b.r * 2 * k);
		}
		const starLayers = [make(), make(), make()];
		for (const s of data.stars) {
			if (s.glow) continue;
			const ctx = starLayers[s.layer].getContext('2d')!;
			ctx.globalAlpha = s.alpha;
			drawStar(ctx, s, s.x * k, s.y * k, k);
		}
		layers = [nebula, ...starLayers];
		liveStars = data.stars.filter((s) => s.glow);
	};

	const layerOffset = (i: number, t: number, scrollPx: number, h: number) => {
		let o = (scrollPx * SCROLL_FACTORS[i] + t * DRIFT_SPEEDS[i] * dpr()) % h;
		if (o < 0) o += h;
		return o;
	};

	return {
		render(nowMs, scrollY) {
			syncSize();
			if (!layers) buildLayers();
			if (!layers || !data) return;
			const ctx = canvas.getContext('2d')!;
			const { width: w, height: h } = canvas;
			const t = nowMs / 1000;
			const scrollPx = scrollY * dpr();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.fillStyle = '#04060b';
			ctx.fillRect(0, 0, w, h);
			layers.forEach((layer, i) => {
				const o = layerOffset(i, t, scrollPx, h);
				ctx.drawImage(layer, 0, -o);
				ctx.drawImage(layer, 0, h - o);
			});
			for (const s of liveStars) {
				const i = s.layer + 1;
				let sy = (s.y * dpr() - layerOffset(i, t, scrollPx, h)) % h;
				if (sy < 0) sy += h;
				ctx.globalAlpha =
					s.alpha * (0.72 + 0.28 * Math.sin(t * s.twinkleSpeed + s.twinklePhase));
				drawStar(ctx, s, s.x * dpr(), sy, dpr());
			}
			ctx.globalAlpha = 1;
		},

		renderRise(nowMs, progress, scrollY, bg) {
			syncSize();
			if (!data) return;
			const ctx = canvas.getContext('2d')!;
			const { width: w, height: h } = canvas;
			const k = dpr();
			const t = nowMs / 1000;
			const scrollPx = scrollY * k;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, w, h);
			for (const b of data.blobs) {
				let by = (b.y * k - layerOffset(0, t, scrollPx, h)) % h;
				if (by < 0) by += h;
				const gradient = ctx.createRadialGradient(b.x * k, by, 0, b.x * k, by, b.r * k);
				gradient.addColorStop(0, `rgba(175,200,255,${(b.a * progress).toFixed(3)})`);
				gradient.addColorStop(1, 'rgba(175,200,255,0)');
				ctx.fillStyle = gradient;
				ctx.fillRect((b.x - b.r) * k, by - b.r * k, b.r * 2 * k, b.r * 2 * k);
			}
			for (const s of data.stars) {
				const threshold = s.riseThreshold * 0.86;
				if (threshold > progress) continue;
				const i = s.layer + 1;
				let sy = (s.y * k - layerOffset(i, t, scrollPx, h)) % h;
				if (sy < 0) sy += h;
				const twinkle = s.glow
					? 0.72 + 0.28 * Math.sin(t * s.twinkleSpeed + s.twinklePhase)
					: 1;
				ctx.globalAlpha = Math.min(1, (progress - threshold) / 0.14) * s.alpha * twinkle;
				drawStar(ctx, s, s.x * k, sy, k);
			}
			ctx.globalAlpha = 1;
		},

		invalidate() {
			data = null;
			layers = null;
		}
	};
}
