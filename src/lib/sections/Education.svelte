<script lang="ts">
	import { schools } from '../profile';
	import SectionHeading from './SectionHeading.svelte';
</script>

<section id="edu">
	<SectionHeading index="02" tag="TRAINING RECORD" title="Education" />
	<div class="cards">
		{#each schools as school (school.name)}
			<article>
				<div class="meta">{school.meta}</div>
				<h3>{school.name}</h3>
				<div class="degree">{school.degree}</div>
				<ul>
					{#each school.notes as note (note)}
						<li>{note}</li>
					{/each}
				</ul>
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
		grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
		gap: 18px;
	}

	article {
		@include corner-brackets;
		border: 1px solid rgb(110 200 230 / 0.2);
		background: rgb(9 14 23 / 0.72);
		padding: 24px 26px;

		@include below($bp-sm) {
			padding: 18px 16px;
		}
	}

	.meta {
		@include mono-label(11px, 0.14em);
		color: var(--color-cyan);
		margin-bottom: 10px;
	}

	h3 {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 19px;
		margin: 0 0 6px;
	}

	.degree {
		color: var(--color-steel);
		font-size: 15px;
		margin-bottom: 14px;
	}

	ul {
		margin: 0;
		padding-left: 18px;
		color: var(--color-slate);
		font-size: 13.5px;
		line-height: 1.6;
		display: grid;
		gap: 4px;
	}
</style>
