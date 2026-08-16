<script lang="ts">
	import { FRAME_COUNT, cuesFor, drawFrame } from './film';
	import SkipButton from './SkipButton.svelte';

	let {
		frame,
		images,
		onskip
	}: { frame: number; images: HTMLImageElement[]; onskip: () => void } = $props();

	let canvas: HTMLCanvasElement;

	const cues = $derived(cuesFor(frame));
	const counter = $derived(String(Math.max(0, frame) + 1).padStart(3, '0'));
	const progressPct = $derived((((Math.max(0, frame) + 1) / FRAME_COUNT) * 100).toFixed(1));

	$effect(() => {
		const img = images[frame];
		if (img) drawFrame(canvas, img);
	});
</script>

<div class="stage" class:shake={cues.shake}>
	<div class="box" data-testid="film-box">
		<canvas bind:this={canvas} aria-hidden="true"></canvas>
		<div class="grain"></div>
		<div class="vignette"></div>
		{#if cues.beep}<div class="sfx beep" aria-hidden="true">ピッ</div>{/if}
		{#if cues.rumble}<div class="rumble" aria-hidden="true"><div>ゴゴゴゴ</div></div>{/if}
		{#if cues.pilot}<div class="pilot">PILOT: S.LIU // VITALS ALL GREEN</div>{/if}
		{#if cues.line}
			<div class="line">
				<div class="slam">ビル・リュウ、行きます!!</div>
				<div class="sub">BILL LIU — LAUNCHING</div>
			</div>
		{/if}
		{#if cues.warn}<div class="warn">⚠ GP-03 // リニア・カタパルト — FIELD CHARGED ⚠</div>{/if}
		{#if cues.boom}<div class="sfx boom" aria-hidden="true">ドオオオン…</div>{/if}
		<div class="counter">REEL 0083 // FRAME {counter} / {FRAME_COUNT}</div>
		<div class="progress" style="width: {progressPct}%"></div>
		<SkipButton onclick={onskip} />
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins' as *;

	.stage {
		@include film-stage;

		&.shake {
			animation: kShake 0.5s linear infinite;
		}

		@media (prefers-reduced-motion: reduce) {
			&.shake {
				animation: none;
			}
		}
	}

	.box {
		@include film-box;
		background: #000;
		overflow: hidden;
		animation: kFadeIn 0.8s ease;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		animation: kZoom 8s ease-in-out infinite alternate;
	}

	// Both sit above the canvas and below the SFX overlays, which paint later in the box.
	// The overhang keeps the grain drift from exposing an edge.
	.grain {
		position: absolute;
		inset: -10%;
		pointer-events: none;
		opacity: 0.07;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E")
			repeat;
		animation: kGrain 0.8s steps(3) infinite;
	}

	.vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(ellipse at center, transparent 52%, rgb(0 0 0 / 0.55) 100%);
	}

	@media (prefers-reduced-motion: reduce) {
		canvas {
			animation: none;
		}

		.grain,
		.vignette {
			display: none;
		}
	}

	.sfx {
		position: absolute;
		font-family: var(--font-display);
		font-weight: 700;
		color: #fff;
		-webkit-text-stroke: 2px #000;
		transform: skew(-8deg);
	}

	.beep {
		top: 5cqh;
		right: 4cqw;
		font-size: clamp(22px, 6cqw, 52px);
		animation: kSfxIn 0.3s cubic-bezier(0.2, 1.4, 0.4, 1);
	}

	.boom {
		top: 38cqh;
		right: 5cqw;
		font-size: clamp(24px, 6.5cqw, 64px);
		animation: kSfxIn 0.35s cubic-bezier(0.2, 1.4, 0.4, 1);
	}

	.rumble {
		position: absolute;
		top: 5cqh;
		right: 3.5cqw;
		animation: kSfxRise 0.45s cubic-bezier(0.2, 1.2, 0.4, 1);

		div {
			writing-mode: vertical-rl;
			font-family: var(--font-display);
			font-weight: 700;
			font-size: clamp(30px, 8cqw, 78px);
			color: #fff;
			-webkit-text-stroke: 2px #000;
			transform: skew(0deg, -4deg);
			letter-spacing: 0.08em;
		}
	}

	.pilot {
		position: absolute;
		top: 2.2cqh;
		right: 2cqw;
		@include mono-label(clamp(8px, 1.4cqw, 11px), 0.18em);
		color: var(--color-mint);
		background: rgb(0 0 0 / 0.72);
		border: 1px solid rgb(126 232 201 / 0.45);
		padding: 5px 12px;
		animation: kSfxRise 0.4s ease-out;
	}

	.line {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2cqh;
		text-align: center;
		pointer-events: none;
	}

	.slam {
		font-family: var(--font-display);
		font-weight: 700;
		font-style: italic;
		font-size: clamp(18px, 6.5cqw, 72px);
		color: #000;
		transform: skew(-10deg);
		line-height: 1.05;
		background: #fff;
		padding: 1.2cqh 3cqw;
		border: 4px solid #000;
		box-shadow: 0 0 0 3px #fff;
		animation: kSlam 0.35s ease-out;
		max-width: 94cqw;
	}

	.sub {
		@include mono-label(clamp(9px, 1.8cqw, 14px), 0.34em);
		color: #000;
		background: #fff;
		padding: 6px 16px;
		animation: kFadeIn 0.5s ease;
	}

	.warn {
		position: absolute;
		bottom: 4.5cqh;
		left: 50%;
		transform: translateX(-50%);
		@include mono-label(clamp(8px, 1.6cqw, 13px), 0.28em);
		color: var(--color-warn);
		background: rgb(0 0 0 / 0.8);
		border: 1px solid rgb(255 208 86 / 0.55);
		padding: 8px 18px;
		white-space: nowrap;
		animation: kBlink 1s steps(1) infinite;
	}

	.counter {
		@include film-hud-badge;
	}

	.progress {
		@include film-progress-bar;
	}
</style>
