import { describe, expect, it } from 'vitest';
import { jobs } from './profile';
import { personJsonLd } from './seo';

describe('personJsonLd', () => {
	it('derives the employer from the current job with the display location stripped', () => {
		const employer = personJsonLd.worksFor.name;
		expect(employer.length).toBeGreaterThan(0);
		expect(employer).not.toContain(' · ');
		expect(jobs[0].org.startsWith(employer)).toBe(true);
	});

	it('pins the identity fields crawlers key on', () => {
		expect(personJsonLd.name).toBe('Shiqiu Liu');
		expect(personJsonLd.email).toBe('mailto:shiqiuliu1997@gmail.com');
		expect(personJsonLd.sameAs).toEqual(['https://www.linkedin.com/in/shiqiu-bill-liu']);
		expect(personJsonLd.alumniOf).toHaveLength(2);
	});
});
