<script lang="ts">
	import SiteHeader from '$lib/sections/SiteHeader.svelte';
	import Hero from '$lib/sections/Hero.svelte';
	import Experience from '$lib/sections/Experience.svelte';
	import Education from '$lib/sections/Education.svelte';
	import Certifications from '$lib/sections/Certifications.svelte';
	import Comms from '$lib/sections/Comms.svelte';
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
	<Experience />
	<Education />
	<Certifications />
	<Comms />
</main>
<SiteFooter />
