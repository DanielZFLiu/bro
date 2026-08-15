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
	<nav>
		{#each nav as { label, href } (href)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same-page fragment anchors; nothing to resolve -->
			<a {href}>{label}</a>
		{/each}
		<button class="replay" onclick={onreplay}>▶ REPLAY LAUNCH</button>
		<button class="snd" onclick={ontogglemute}>{muted ? 'SND: OFF' : 'SND: ON'}</button>
	</nav>
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

		@include below($bp-md) {
			padding: 10px 14px;
		}
	}

	.brand {
		@include mono-label(12px, 0.14em);
		color: var(--color-slate);
		white-space: nowrap;
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 8px 16px;
		@include mono-label(11px, 0.12em);

		@include below($bp-md) {
			gap: 6px 10px;
			letter-spacing: 0.06em;
		}

		a {
			color: var(--color-slate);
			white-space: nowrap;

			&:hover {
				color: var(--color-cyan-bright);
			}
		}
	}

	button {
		@include mono-label(11px, 0.12em);
		white-space: nowrap;
		background: none;
		padding: 5px 10px;
		cursor: pointer;
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
