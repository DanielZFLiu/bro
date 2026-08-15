<script lang="ts">
	import { createSkyRenderer } from '../starfield/sky';
	import { FRAME_COUNT } from './film';
	import type { Phase } from './sequence';
	import FilmFrame from './FilmFrame.svelte';
	import IgnitePanel from './IgnitePanel.svelte';
	import SkipButton from './SkipButton.svelte';
	import StandbyPanel from './StandbyPanel.svelte';

	let {
		phase,
		frame,
		framesLoaded,
		muted,
		images,
		oninitiate,
		onskip,
		ontogglemute
	}: {
		phase: Phase;
		frame: number;
		framesLoaded: number;
		muted: boolean;
		images: HTMLImageElement[];
		oninitiate: () => void;
		onskip: () => void;
		ontogglemute: () => void;
	} = $props();

	let riseCanvas: HTMLCanvasElement | undefined = $state();

	const loadedPct = $derived(Math.round((framesLoaded / FRAME_COUNT) * 100));
	const rising = $derived(phase === 'starrise' || phase === 'reveal');

	// Guarded on `rising`, not `phase`: a derived that stays true across starrise -> reveal
	// keeps this effect alive; re-running it would snap the sky back to black mid-fade.
	$effect(() => {
		if (!rising || !riseCanvas) return;
		const renderer = createSkyRenderer(riseCanvas);
		const start = performance.now();
		const HOLD = 450;
		let raf = 0;
		let last = 0;
		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			if (now - last < 40) return;
			last = now;
			const elapsed = now - start;
			const black = Math.min(1, elapsed / HOLD);
			const bg = `rgb(${Math.round(4 * black)},${Math.round(6 * black)},${Math.round(11 * black)})`;
			const t = Math.max(0, Math.min(1, (elapsed - HOLD) / 3300));
			renderer.renderRise(now, 1 - Math.pow(1 - t, 3), window.scrollY, bg);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
</script>

{#if phase !== 'site'}
	<div class="overlay" class:reveal={phase === 'reveal'} data-testid="intro-overlay">
		{#if phase === 'standby'}
			<StandbyPanel {loadedPct} {muted} {oninitiate} {onskip} {ontogglemute} />
		{:else if phase === 'ignite'}
			<IgnitePanel />
			<SkipButton onclick={onskip} />
		{:else if phase === 'film'}
			<FilmFrame {frame} {images} {onskip} />
		{:else}
			<canvas bind:this={riseCanvas} class="rise" aria-hidden="true"></canvas>
			{#if phase === 'starrise'}
				<div class="fade-stage">
					<div class="film-fade">
						<div class="bar"></div>
						<div class="counter">REEL 0083 // FRAME {FRAME_COUNT} / {FRAME_COUNT}</div>
					</div>
				</div>
				<SkipButton onclick={onskip} />
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins' as *;

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: #000;
		overflow: hidden;

		&.reveal {
			animation: kFadeOut 1.4s ease forwards;
			pointer-events: none;
		}
	}

	.rise {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.fade-stage {
		@include film-stage;
		pointer-events: none;
	}

	.film-fade {
		@include film-box;
		animation: kFadeOut 0.9s ease 0.15s forwards;

		.bar {
			@include film-progress-bar;
			right: 0;
		}

		.counter {
			@include film-hud-badge;
		}
	}
</style>
