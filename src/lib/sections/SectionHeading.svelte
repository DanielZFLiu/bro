<script lang="ts">
	let { index, tag, title }: { index: string; tag: string; title: string } = $props();
</script>

<div class="heading">
	<span class="tag">{index} // {tag}</span>
	<h2>{title}</h2>
	<div class="rule"></div>
</div>

<style lang="scss">
	@use '../../styles/mixins' as *;

	.heading {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 8px 16px;
		margin-bottom: 36px;
	}

	.tag {
		@include mono-label(12px, 0.2em);
		color: var(--color-amber);
	}

	h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(26px, 4vw, 34px);
		margin: 0;
	}

	.rule {
		flex: 1;
		height: 1px;
		background: rgb(110 200 230 / 0.18);
		min-width: 60px;
	}
</style>
