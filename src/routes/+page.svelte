<script lang="ts">
	import { browser } from '$app/environment';
	import { createAudioEngine } from '$lib/audio/engine';
	import LaunchIntro from '$lib/launch/LaunchIntro.svelte';
	import { preloadFrames } from '$lib/launch/film';
	import { createLaunchSequence, type Phase } from '$lib/launch/sequence';
	import Starfield from '$lib/starfield/Starfield.svelte';
	import Certifications from '$lib/sections/Certifications.svelte';
	import Comms from '$lib/sections/Comms.svelte';
	import Education from '$lib/sections/Education.svelte';
	import Experience from '$lib/sections/Experience.svelte';
	import Hero from '$lib/sections/Hero.svelte';
	import SiteFooter from '$lib/sections/SiteFooter.svelte';
	import SiteHeader from '$lib/sections/SiteHeader.svelte';

	// URL switches: ?intro=off is the share link (no intro, no audio);
	// ?fps=N runs the silent synth reel at N fps (e2e shortens the 57.7s film).
	const params = browser ? new URLSearchParams(location.search) : null;
	const introOff = params?.get('intro') === 'off';
	const fpsOverride = params ? Number(params.get('fps')) || undefined : undefined;

	const initialPhase: Phase = introOff ? 'site' : 'standby';

	let phase: Phase = $state(initialPhase);
	let frame = $state(-1);
	let framesLoaded = $state(0);
	let muted = $state(false);
	let images: HTMLImageElement[] = $state([]);

	const audio = createAudioEngine({ reelEnabled: !fpsOverride });
	const sequence = createLaunchSequence({
		audio,
		fallbackFps: fpsOverride,
		startAtSite: introOff,
		isFrameReady: (i) => images[i]?.complete ?? false,
		onPhase: (p) => (phase = p),
		onFrame: (i) => (frame = i)
	});

	let hydrated = $state(false); // e2e waits on this before clicking prerendered buttons

	$effect(() => {
		hydrated = true;
		images = preloadFrames((n) => (framesLoaded = n));
		audio.load();
		return () => {
			sequence.destroy();
			audio.dispose();
		};
	});

	// Scroll resets only on phase transitions, so #anchor deep links survive initial mount.
	let prevPhase: Phase = initialPhase;
	$effect(() => {
		document.body.style.overflow = phase === 'site' ? '' : 'hidden';
		if (phase !== prevPhase) {
			window.scrollTo(0, 0);
			prevPhase = phase;
		}
	});

	const toggleMute = () => (muted = audio.toggleMuted());
</script>

<svelte:head>
	<title>Shiqiu (Bill) Liu — Pilot Registry</title>
	<meta
		name="description"
		content="Risk-focused financial analyst in Hong Kong — client due diligence, AML risk, quantitative analysis."
	/>
</svelte:head>

<Starfield />
<div class="site" data-hydrated={hydrated}>
	<SiteHeader {muted} onreplay={() => sequence.replay()} ontogglemute={toggleMute} />
	<main>
		<Hero introDone={phase === 'site'} />
		<Experience />
		<Education />
		<Certifications />
		<Comms />
	</main>
	<SiteFooter />
</div>
<LaunchIntro
	{phase}
	{frame}
	{framesLoaded}
	{muted}
	{images}
	oninitiate={() => sequence.initiate()}
	onskip={() => sequence.skip()}
	ontogglemute={toggleMute}
/>

<style>
	.site {
		position: relative;
		z-index: 1;
	}
</style>
