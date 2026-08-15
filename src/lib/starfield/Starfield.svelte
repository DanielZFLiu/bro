<script lang="ts">
	import { createSkyRenderer } from './sky';

	let canvas: HTMLCanvasElement;

	// Scroll is read from window inside these callbacks, not bound to $state: a reactive scroll
	// value would be an effect dependency and rebuild the sky and its layers on every scroll.
	$effect(() => {
		const renderer = createSkyRenderer(canvas);
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		let raf = 0;
		let last = 0;

		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			if (document.hidden || now - last < 33) return;
			last = now;
			renderer.render(now, window.scrollY);
		};

		const renderStatic = () => renderer.render(0, window.scrollY);
		const onScroll = () => {
			if (reduced.matches) renderStatic();
		};
		const onResize = () => {
			renderer.invalidate();
			if (reduced.matches) renderStatic();
		};
		const applyMotionPreference = () => {
			cancelAnimationFrame(raf);
			if (reduced.matches) renderStatic();
			else raf = requestAnimationFrame(loop);
		};

		applyMotionPreference();
		reduced.addEventListener('change', applyMotionPreference);
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			cancelAnimationFrame(raf);
			reduced.removeEventListener('change', applyMotionPreference);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
	}
</style>
