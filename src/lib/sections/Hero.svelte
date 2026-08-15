<script lang="ts">
	import { hero } from '../profile';

	let { introDone }: { introDone: boolean } = $props();

	let scrollY = $state(0);
	let cueArmed = $state(false);
	let hasScrolled = $state(false);

	// One-way latch (as the prototype): once the user scrolls, the cue never returns.
	$effect(() => {
		if (scrollY > 40) hasScrolled = true;
	});

	$effect(() => {
		if (!introDone) {
			cueArmed = false;
			hasScrolled = false;
			return;
		}
		const t = setTimeout(() => (cueArmed = true), 2800);
		return () => clearTimeout(t);
	});

	const cueVisible = $derived(cueArmed && !hasScrolled);
</script>

<svelte:window bind:scrollY />

<section class="hero" data-testid="hero">
	<div class="inner">
		<div class="intro">
			<div class="kicker">
				{hero.kicker} <span class="text-faint">////</span>
				{hero.kickerLocale}
			</div>
			<h1>{hero.nameLines[0]}<br />{hero.nameLines[1]}</h1>
			<div class="kana">{hero.kana}</div>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- static in-repo copy, never user input -->
			<p class="bio">{@html hero.bio}</p>
			<div class="chips">
				{#each hero.chips as chip (chip)}
					<span>{chip}</span>
				{/each}
			</div>
			<div class="cue" class:visible={cueVisible}>
				<div>▼ SCROLL FOR MISSION LOG</div>
			</div>
		</div>
		<div class="portrait">
			<div class="ring">
				{#if hero.portraitSrc}
					<img class="photo" src={hero.portraitSrc} alt="Portrait of Bill Liu" />
				{:else}
					<div class="placeholder">
						<div class="crosshair"></div>
						<div class="label">AWAITING<br />PILOT PHOTO</div>
					</div>
				{/if}
			</div>
			<div class="tag">{hero.portraitTag}</div>
		</div>
	</div>
</section>

<style lang="scss">
	@use '../../styles/mixins' as *;

	.hero {
		min-height: 92vh;
		display: flex;
		align-items: center;
		padding: 60px 7vw;

		@include below($bp-md) {
			min-height: 86vh;
			padding: 40px 6vw;
		}
	}

	.inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 56px;
		width: 100%;
		max-width: 1240px;
		margin-inline: auto;

		@include below($bp-md) {
			gap: 36px;
		}
	}

	.intro {
		flex: 1 1 480px;
		min-width: min(320px, 100%);
	}

	.kicker {
		@include mono-label(12px, 0.22em);
		color: var(--color-amber);
		margin-bottom: 18px;
	}

	h1 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(40px, 7.2vw, 92px);
		line-height: 1.02;
		margin: 0;
		letter-spacing: 0.01em;
	}

	.kana {
		@include mono-label(14px, 0.32em);
		color: var(--color-dim);
		margin: 14px 0 26px;
	}

	.bio {
		font-size: clamp(16px, 1.8vw, 18px);
		line-height: 1.6;
		color: var(--color-steel);
		max-width: 56ch;
		margin: 0 0 30px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;

		span {
			@include mono-label(11px, 0.1em);
			color: var(--color-cyan);
			border: 1px solid rgb(98 211 232 / 0.35);
			padding: 7px 12px;
			background: rgb(98 211 232 / 0.06);
		}
	}

	.cue {
		margin-top: 56px;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 1.1s ease,
			visibility 0s linear 1.1s;

		&.visible {
			opacity: 1;
			visibility: visible;
			transition: opacity 1.1s ease;
		}

		div {
			@include mono-label(11px, 0.2em);
			color: var(--color-slate);
			animation: kCue 2.4s ease-in-out infinite;
		}
	}

	.portrait {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		margin-inline: auto;
	}

	.ring {
		position: relative;
		width: clamp(180px, 24vw, 230px);
		aspect-ratio: 1;
		border: 1px solid rgb(98 211 232 / 0.35);
		border-radius: 50%;
		padding: 9px;
	}

	.photo {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.placeholder {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: rgb(9 14 23 / 0.72);
		border: 1px dashed rgb(98 211 232 / 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.crosshair {
		position: absolute;
		inset: 0;

		&::before,
		&::after {
			content: '';
			position: absolute;
			background: rgb(98 211 232 / 0.18);
		}

		&::before {
			left: 50%;
			top: 8%;
			bottom: 8%;
			width: 1px;
		}

		&::after {
			top: 50%;
			left: 8%;
			right: 8%;
			height: 1px;
		}
	}

	.label {
		@include mono-label(10px, 0.18em);
		color: var(--color-dim);
		text-align: center;
		line-height: 1.8;
	}

	.tag {
		@include mono-label(10px, 0.18em);
		color: var(--color-dim);
	}
</style>
