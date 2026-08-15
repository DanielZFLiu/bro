<script lang="ts">
	import { footerLine } from '../profile';
</script>

<footer>{footerLine}</footer>

<style lang="scss">
	@use '../../styles/mixins' as *;

	footer {
		padding: 26px;
		text-align: center;
		border-top: 1px solid rgb(110 200 230 / 0.12);
		@include mono-label(10.5px, 0.16em);
		color: var(--color-faint);
	}
</style>
