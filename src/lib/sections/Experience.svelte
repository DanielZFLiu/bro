<script lang="ts">
	import { jobs } from '../profile';
	import SectionHeading from './SectionHeading.svelte';
</script>

<section id="exp">
	<SectionHeading index="01" tag="MISSION LOG" title="Experience" />
	<div class="cards">
		{#each jobs as job (job.title)}
			<article>
				<div class="head">
					<h3>{job.title}</h3>
					<span class="period">{job.period}</span>
				</div>
				<div class="org">{job.org}</div>
				<ul>
					{#each job.bullets as bullet (bullet)}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- static in-repo copy, never user input -->
						<li>{@html bullet}</li>
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

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px 18px;
		justify-content: space-between;
	}

	h3 {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 20px;
		margin: 0;
	}

	.period {
		@include mono-label(12px, 0.08em);
		color: var(--color-amber);
	}

	.org {
		@include mono-label(12px, 0.06em);
		color: var(--color-slate);
		margin: 6px 0 14px;
	}

	ul {
		margin: 0;
		padding-left: 18px;
		color: var(--color-steel);
		font-size: 14.5px;
		line-height: 1.65;
		display: grid;
		gap: 6px;
	}
</style>
