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
	<div class="frame">
		<div class="box" data-testid="film-box">
			<canvas bind:this={canvas} aria-hidden="true"></canvas>
			{#if cues.beep}<div class="sfx beep" aria-hidden="true">ピッ</div>{/if}
			{#if cues.rumble}<div class="rumble" aria-hidden="true"><div>ゴゴゴゴ</div></div>{/if}
			{#if cues.pilot}<div class="pilot">PILOT: S.LIU // VITALS ALL GREEN</div>{/if}
			{#if cues.line}
				<div class="line">
					<div class="slam">ビル・リュウ、行きます!!</div>
					<div class="sub">BILL LIU — LAUNCHING</div>
				</div>
			{/if}
			{#if cues.warn}
				<div class="warn">⚠ GP-03 // リニア・カタパルト — FIELD CHARGED ⚠</div>
			{/if}
			{#if cues.boom}<div class="sfx boom" aria-hidden="true">ドオオオン…</div>{/if}
			<div class="progress" style="width: {progressPct}%"></div>
		</div>
		<div class="counter">REEL 0083 // FRAME {counter} / {FRAME_COUNT}</div>
		<SkipButton onclick={onskip} class="skip" />
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

	.frame {
		@include film-frame;
		animation: kFadeIn 0.8s ease;
	}

	.box {
		@include film-box;
		background: #000;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	// White glyphs over white ink art: on small boxes the stroke paints behind the fill instead of
	// eating it, which already halves the outline that shows, and a soft glow separates them.
	.sfx,
	.rumble div {
		font-family: var(--font-display);
		font-weight: 700;
		color: #fff;
		-webkit-text-stroke: 2px #000;

		@include film-small-box {
			paint-order: stroke;
			text-shadow: 0 0 8px rgb(0 0 0 / 0.6);
		}
	}

	.sfx {
		position: absolute;
		transform: skew(-8deg);
	}

	.beep {
		top: 5cqh;
		right: 4cqw;
		font-size: clamp(22px, 6cqw, 52px);
		animation: kSfxIn 0.3s cubic-bezier(0.2, 1.4, 0.4, 1);

		@include film-small-box {
			font-size: clamp(28px, 8cqw, 40px);
		}
	}

	.boom {
		top: 38cqh;
		right: 5cqw;
		font-size: clamp(24px, 6.5cqw, 64px);
		animation: kSfxIn 0.35s cubic-bezier(0.2, 1.4, 0.4, 1);

		@include film-small-box {
			font-size: clamp(30px, 8.5cqw, 44px);
		}
	}

	.rumble {
		position: absolute;
		top: 5cqh;
		right: 3.5cqw;
		animation: kSfxRise 0.45s cubic-bezier(0.2, 1.2, 0.4, 1);

		div {
			writing-mode: vertical-rl;
			font-size: clamp(30px, 8cqw, 78px);
			transform: skew(0deg, -4deg);
			letter-spacing: 0.08em;

			// Four vertical glyphs have to clear the box height, so this stays under the others.
			@include film-small-box {
				font-size: clamp(36px, 10cqw, 46px);
			}
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

		@include film-small-box {
			font-size: clamp(23px, 7cqw, 34px);
		}
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

		// Width is explicit: shrink-to-fit against `left: 50%` would wrap at half the box.
		@include film-small-box {
			width: 92cqw;
			white-space: normal;
			text-align: center;
		}
	}

	.counter {
		@include film-hud-badge;
	}

	.progress {
		@include film-progress-bar;
	}

	// The button hangs off the frame, so the margins hold it inside the film border; a box with
	// no room for chrome steps it below the frame instead.
	.frame :global(.skip) {
		margin: 0 $film-border $film-border 0;

		@include film-small-box {
			top: 100%;
			bottom: auto;
			right: 0;
			margin: 6px 0 0;
		}
	}
</style>
