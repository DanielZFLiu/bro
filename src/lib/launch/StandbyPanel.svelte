<script lang="ts">
	import { hero } from '../profile';
	import { FRAME_COUNT } from './film';

	let {
		loadedPct,
		muted,
		oninitiate,
		onskip,
		ontogglemute
	}: {
		loadedPct: number;
		muted: boolean;
		oninitiate: () => void;
		onskip: () => void;
		ontogglemute: () => void;
	} = $props();
</script>

<div class="standby">
	<div class="panel" data-testid="standby-panel">
		<div class="registry">PERSONNEL DOSSIER // MS-PILOT REGISTRY</div>
		<div class="name">{hero.nameLines.join(' ')}</div>
		<div class="kana">{hero.kana}</div>
		<button class="initiate" onclick={oninitiate}>▶ INITIATE LAUNCH SEQUENCE</button>
		<div class="reel">FILM REEL: <span>{loadedPct}%</span> LOADED · {FRAME_COUNT} FRAMES</div>
		<div class="row">
			<button onclick={onskip}>SKIP INTRO →</button>
			<button onclick={ontogglemute}>{muted ? 'SND: OFF' : 'SND: ON'}</button>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins' as *;

	.standby {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: #000
			repeating-linear-gradient(0deg, rgb(255 255 255 / 0.028) 0 1px, transparent 1px 3px);
	}

	.panel {
		border: 3px solid #fff;
		padding: clamp(28px, 6vw, 56px) clamp(24px, 6vw, 60px);
		text-align: center;
		max-width: 560px;
		background: #000;
		animation: kFadeIn 0.8s ease;
	}

	.registry {
		@include mono-label(11px, 0.3em);
		color: var(--color-slate);
		margin-bottom: 18px;
	}

	.name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(28px, 6vw, 40px);
		color: #fff;
		line-height: 1.1;
	}

	.kana {
		@include mono-label(12px, 0.26em);
		color: var(--color-dim);
		margin: 10px 0 36px;
	}

	.initiate {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(15px, 2vw, 17px);
		letter-spacing: 0.12em;
		background: #fff;
		color: #000;
		border: none;
		padding: 16px clamp(20px, 4vw, 34px);
		cursor: pointer;

		&:hover {
			background: var(--color-cyan);
		}
	}

	.reel {
		margin-top: 22px;
		@include mono-label(10.5px, 0.2em);
		color: var(--color-dim);

		span {
			color: var(--color-mint);
		}
	}

	.row {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 12px 26px;
		margin-top: 18px;

		button {
			@include mono-label(11px, 0.14em);
			white-space: nowrap;
			background: none;
			border: none;
			color: var(--color-dim);
			cursor: pointer;

			&:hover {
				color: var(--color-ink);
			}
		}
	}
</style>
