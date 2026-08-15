<script lang="ts">
	import { comms } from '../profile';
</script>

<section id="comms">
	<div class="tag">04 // COMMS</div>
	<h2>Open a channel</h2>
	<p>{comms.blurb}</p>
	<div class="links">
		<a class="primary" href="mailto:{comms.email}">✉ {comms.email.toUpperCase()}</a>
		<a class="secondary" href={comms.linkedin} target="_blank" rel="noopener external"
			>LINKEDIN ↗</a
		>
	</div>
</section>

<style lang="scss">
	@use '../../styles/mixins' as *;

	section {
		padding: 90px 7vw 70px;
		max-width: 760px;
		margin: 0 auto;
		text-align: center;

		@include below($bp-md) {
			padding: 60px 6vw 50px;
		}
	}

	.tag {
		@include mono-label(12px, 0.2em);
		color: var(--color-amber);
		margin-bottom: 14px;
	}

	h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(30px, 5vw, 38px);
		margin: 0 0 12px;
	}

	p {
		color: var(--color-slate);
		font-size: 16px;
		margin: 0 0 32px;
	}

	.links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 14px;
	}

	a {
		@include mono-label(13px, 0.08em);
		padding: 13px 24px;
		overflow-wrap: anywhere;
	}

	.primary {
		border: 1px solid var(--color-cyan);
		color: var(--color-cyan);
		background: rgb(98 211 232 / 0.06);

		&:hover {
			background: rgb(98 211 232 / 0.16);
			color: var(--color-cyan-bright);
		}
	}

	.secondary {
		border: 1px solid rgb(143 161 179 / 0.4);
		color: var(--color-steel);

		&:hover {
			border-color: var(--color-cyan);
			color: var(--color-cyan-bright);
		}
	}
</style>
