<script lang="ts">
	import { nav } from '../profile';

	let {
		muted,
		onreplay,
		ontogglemute
	}: { muted: boolean; onreplay: () => void; ontogglemute: () => void } = $props();
</script>

<header>
	<div class="brand">S.LIU <span class="text-cyan">//</span> HKG</div>
	<nav class="links">
		{#each nav as { label, href } (href)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same-page fragment anchors; nothing to resolve -->
			<a {href}>{label}</a>
		{/each}
	</nav>
	<div class="controls">
		<button class="replay" onclick={onreplay}>▶ REPLAY LAUNCH</button>
		<button class="snd" onclick={ontogglemute}>{muted ? 'SND: OFF' : 'SND: ON'}</button>
	</div>
</header>

<style lang="scss">
	@use '../../styles/mixins' as *;

	header {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
		padding: 14px 28px;
		background: rgb(4 6 11 / 0.72);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgb(110 200 230 / 0.18);

		// Two deliberate rows on phones: brand and controls, then the links beneath them.
		@include below($bp-md) {
			flex-wrap: wrap;
			gap: 10px 12px;
			padding: 10px 14px;
		}
	}

	.brand {
		@include mono-label(12px, 0.14em);
		color: var(--color-slate);
		white-space: nowrap;
	}

	.links {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px 16px;
		margin-left: auto; // packs the links and the controls together against the right edge
		@include mono-label(11px, 0.12em);

		@include below($bp-md) {
			order: 1;
			flex-basis: 100%;
			justify-content: space-between;
			letter-spacing: 0.04em;
		}

		a {
			color: var(--color-slate);
			white-space: nowrap;

			&:hover {
				color: var(--color-cyan-bright);
			}
		}
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 16px;

		@include below($bp-md) {
			gap: 8px;
		}
	}

	button {
		@include mono-label(11px, 0.12em);
		white-space: nowrap;
		background: none;
		padding: 5px 10px;
		cursor: pointer;

		@include below($bp-md) {
			letter-spacing: 0.05em;
			padding: 5px 8px;
		}
	}

	.replay {
		border: 1px solid rgb(98 211 232 / 0.4);
		color: var(--color-cyan);

		&:hover {
			background: rgb(98 211 232 / 0.12);
		}
	}

	.snd {
		border: 1px solid rgb(143 161 179 / 0.3);
		color: var(--color-slate);

		&:hover {
			color: var(--color-ink);
		}
	}
</style>
