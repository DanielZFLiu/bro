<script lang="ts">
	import SiteHeader from '$lib/sections/SiteHeader.svelte';
	import Hero from '$lib/sections/Hero.svelte';
	import SiteFooter from '$lib/sections/SiteFooter.svelte';
</script>

<svelte:head>
	<title>Shiqiu (Bill) Liu — Pilot Registry</title>
	<meta
		name="description"
		content="Risk-focused financial analyst in Hong Kong — client due diligence, AML risk, quantitative analysis."
	/>
</svelte:head>

<SiteHeader muted={false} onreplay={() => {}} ontogglemute={() => {}} />
<main>
	<Hero introDone={true} />
</main>
<SiteFooter />
