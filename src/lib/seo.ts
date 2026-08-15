// Canonical URLs and schema.org metadata. Copy derives from profile.ts wherever it exists there.
import { comms, jobs, schools } from './profile';

export const siteUrl = 'https://bill-liu.com';
export const canonicalUrl = `${siteUrl}/`;
export const ogImageUrl = `${siteUrl}/og.png`;

const [currentJob] = jobs;
const employer = currentJob.org.split(' · ')[0]; // profile orgs append ' · location' for display

export const personJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Person',
	name: 'Shiqiu Liu',
	alternateName: ['Bill Liu', 'Shiqiu (Bill) Liu'],
	url: canonicalUrl,
	image: ogImageUrl,
	jobTitle: currentJob.title,
	worksFor: { '@type': 'Organization', name: employer },
	alumniOf: schools.map((school) => ({ '@type': 'CollegeOrUniversity', name: school.name })),
	knowsAbout: [
		'AML risk management',
		'Client due diligence',
		'Quantitative analysis',
		'Financial risk management'
	],
	email: `mailto:${comms.email}`,
	address: { '@type': 'PostalAddress', addressRegion: 'Hong Kong SAR' },
	sameAs: [comms.linkedin]
};

// Tag assembled here rather than in markup: a literal </script> inside a Svelte expression
// derails the parser. Render with {@html} inside <svelte:head>.
export const personJsonLdScript = `<script type="application/ld+json">${JSON.stringify(personJsonLd)}</script>`;
