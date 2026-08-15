<div class="ignite">
	<div class="scanlines"></div>
	<div class="sweep"></div>
	<div class="axis h"></div>
	<div class="axis v"></div>
	<div class="outer ring"></div>
	<div class="inner ring"></div>
	<div class="digit three">3</div>
	<div class="digit two">2</div>
	<div class="label">REEL 0083 // PICTURE START</div>
</div>

<style lang="scss">
	@use '../../styles/mixins' as *;

	.ignite {
		position: absolute;
		inset: 16px;
		border: 3px solid #fff;
		background: #0b0b09;
		overflow: hidden;
		animation: kFadeIn 0.25s ease;
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			rgb(255 255 255 / 0.025) 0 1px,
			transparent 1px 3px
		);
	}

	.sweep {
		position: absolute;
		inset: 0;
		background: conic-gradient(
			from 0deg at 50% 50%,
			rgb(232 228 216 / 0.13) 0 12deg,
			transparent 12deg 360deg
		);
		animation: kSpin 1s linear infinite;
	}

	.axis {
		position: absolute;
		background: rgb(232 228 216 / 0.22);

		&.h {
			left: 0;
			right: 0;
			top: 50%;
			height: 1px;
		}

		&.v {
			top: 0;
			bottom: 0;
			left: 50%;
			width: 1px;
		}
	}

	.ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;

		&.outer {
			width: 58vmin;
			height: 58vmin;
			border: 2px solid rgb(232 228 216 / 0.5);
		}

		&.inner {
			width: 45vmin;
			height: 45vmin;
			border: 1px solid rgb(232 228 216 / 0.32);
		}
	}

	.digit {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 30vmin;
		color: var(--color-paper);

		&.three {
			animation: kVanish 0s linear 1s forwards;
		}

		&.two {
			opacity: 0;
			animation: kAppear 0s linear 1s forwards;
		}
	}

	.label {
		position: absolute;
		bottom: 5vh;
		left: 0;
		right: 0;
		text-align: center;
		@include mono-label(12px, 0.3em);
		color: rgb(232 228 216 / 0.6);
	}
</style>
