<script lang="ts">
	import { certs } from '../profile';
	import SectionHeading from './SectionHeading.svelte';
</script>

<section id="certs">
	<SectionHeading index="03" tag="QUALIFICATIONS" title="Certifications" />
	<div class="cards">
		{#each certs as cert (cert.title)}
			<article class={cert.tone}>
				<div class="issuer">{cert.issuer}</div>
				<h3>{cert.title}</h3>
				<div class="detail">{cert.detail}</div>
			</article>
		{/each}
	</div>
</section>

<style lang="scss">
	@use '../../styles/mixins' as *;

	section {
		padding: 80px 7vw;
		max-width: 1160px;
		margin: 0 auto;

		@include below($bp-md) {
			padding: 56px 6vw;
		}
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
		gap: 18px;
	}

	article {
		padding: 22px;

		&.amber {
			border: 1px solid rgb(240 180 69 / 0.35);
			background: rgb(20 15 6 / 0.5);

			.issuer {
				color: var(--color-amber);
			}
		}

		&.cyan {
			border: 1px solid rgb(110 200 230 / 0.25);
			background: rgb(9 14 23 / 0.72);

			.issuer {
				color: var(--color-cyan);
			}
		}
	}

	.issuer {
		@include mono-label(10px, 0.18em);
		margin-bottom: 12px;
	}

	h3 {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 18px;
		margin: 0 0 8px;
	}

	.detail {
		@include mono-label(11px, 0.08em);
		color: var(--color-dim);
	}
</style>
