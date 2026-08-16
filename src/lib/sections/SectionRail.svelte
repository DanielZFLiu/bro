<script lang="ts">
	import { nav } from '../profile';

	const items = nav.map(({ label, href }, i) => ({
		label,
		href,
		id: href.slice(1),
		index: String(i + 1).padStart(2, '0')
	}));

	let activeId = $state(items[0].id);

	// Sections are ranked against a band across the upper middle of the viewport; the first one
	// in document order that touches it owns the rail, and the last winner sticks over the
	// hero and the footer, where no section reaches the band.
	$effect(() => {
		const inBand: Record<string, boolean> = {};
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) inBand[entry.target.id] = entry.isIntersecting;
				const first = items.find(({ id }) => inBand[id]);
				if (first) activeId = first.id;
			},
			{ rootMargin: '-30% 0px -55% 0px' }
		);
		for (const { id } of items) {
			const section = document.getElementById(id);
			if (section) observer.observe(section);
		}
		return () => observer.disconnect();
	});
</script>

<nav class="rail" aria-label="Section index">
	{#each items as { label, href, id, index } (href)}
		{@const current = id === activeId}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same-page fragment anchors; nothing to resolve -->
		<a {href} class:active={current} aria-current={current ? 'location' : undefined}>
			<span class="index">{index}</span>
			<span class="label">{label}</span>
		</a>
	{/each}
</nav>

<style lang="scss">
	@use '../../styles/mixins' as *;

	.rail {
		position: fixed;
		top: 50%;
		right: 22px;
		z-index: 4;
		transform: translateY(-50%);
		display: grid;
		justify-items: end;
		gap: 16px;

		@include below($bp-lg) {
			display: none;
		}
	}

	a {
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		gap: 8px;
		@include mono-label(10px, 0.24em);
		color: var(--color-dim);
		transition: color 0.25s ease;

		&.active {
			color: var(--color-amber);
		}

		&:hover {
			color: var(--color-cyan-bright);
		}
	}

	// Labels stay collapsed so the rail never reaches into the content column on narrow desktops.
	.label {
		max-width: 0;
		overflow: hidden;
		white-space: nowrap;
		opacity: 0;
		transition:
			max-width 0.3s ease,
			opacity 0.3s ease;

		a:hover &,
		a:focus-visible & {
			max-width: 180px;
			opacity: 1;
		}
	}
</style>
