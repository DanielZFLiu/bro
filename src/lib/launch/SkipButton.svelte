<script lang="ts">
	let { onclick }: { onclick: () => void } = $props();
</script>

<button {onclick}>SKIP →</button>

<style lang="scss">
	@use '../../styles/mixins' as *;

	button {
		position: absolute;
		bottom: clamp(10px, 2.4svh, 22px);
		right: clamp(12px, 2svw, 26px);
		z-index: 5;
		@include mono-label(11px, 0.16em);
		background: rgb(0 0 0 / 0.55);
		border: 1px solid rgb(255 255 255 / 0.35);
		color: var(--color-steel);
		padding: 8px 14px;
		cursor: pointer;

		&:hover {
			border-color: #fff;
			color: #fff;
		}
	}
</style>
