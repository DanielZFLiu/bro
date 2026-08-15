// All site copy. `bio` and `bullets` may carry <strong> spans rendered via {@html}.
export interface NavLink {
	label: string;
	href: string;
}
export interface Job {
	title: string;
	org: string;
	period: string;
	bullets: string[];
}
export interface School {
	meta: string;
	name: string;
	degree: string;
	notes: string[];
}
export interface Cert {
	issuer: string;
	title: string;
	detail: string;
	tone: 'amber' | 'cyan';
}

export const nav: NavLink[] = [
	{ label: 'MISSION LOG', href: '#exp' },
	{ label: 'TRAINING', href: '#edu' },
	{ label: 'CERTS', href: '#certs' },
	{ label: 'COMMS', href: '#comms' }
];

export const hero = {
	kicker: 'PILOT REGISTRY',
	kickerLocale: 'HONG KONG SAR',
	nameLines: ['SHIQIU', '(BILL) LIU'],
	kana: 'シキュウ・ビル・リュウ',
	bio: 'Risk-focused financial analyst at <strong class="text-ink">Huatai Financial Holdings (Hong Kong)</strong>. Client due diligence, AML risk management, and quantitative analysis — Python and SQL under the hood, trained at Rotman and Waterloo.',
	chips: ['CFA LEVEL II', 'PYTHON · R · MYSQL', 'P&L MODELLING'],
	portraitTag: 'ID-1997 // ACTIVE DUTY',
	portraitSrc: null as string | null // drop a photo in static/ and point this at it
};

export const jobs: Job[] = [
	{
		title: 'Client Reference Data Specialist',
		org: 'Huatai Financial Holdings (Hong Kong) Limited · Hong Kong SAR',
		period: 'JUL 2025 — PRESENT',
		bullets: [
			'Client reference data management — analysis, cleansing, and remediation of records to resolve inaccuracies and ensure data integrity.',
			'KYC documents and external research for data input and maintenance in core proprietary systems, under strict company and regulatory guidelines.',
			'Data lifecycle management with business units across the firm to verify accuracy for firm-wide use.'
		]
	},
	{
		title: 'Financial Analyst',
		org: 'Sonim Technologies, Inc.',
		period: 'JUN 2024 — JUL 2025',
		bullets: [
			'Financial trend analysis on revenue, COGS, and operating expenses — identifying key drivers to inform strategic decisions.',
			'Quarterly limit-review preparations: business-change inputs, top-down and bottom-up quantitative analyses, recommendations presented to senior finance and risk stakeholders.'
		]
	},
	{
		title: 'Relationship Partner',
		org: 'JPMorgan Chase & Co. · China',
		period: 'DEC 2021 — APR 2024',
		bullets: [
			'<strong class="text-amber">"Best Partner" award</strong>, China Operations team, 2023.',
			'Spearheaded end-to-end KYC onboarding for new clients — compliant, with optimized turnaround time for long-term relationships.',
			'Partnerships across legal, compliance, credit, and operations to keep information flowing and eliminate roadblocks.'
		]
	}
];

export const schools: School[] = [
	{
		meta: '2021 · GPA 3.7',
		name: 'University of Toronto — Rotman School of Management',
		degree: 'Master of Financial Risk Management',
		notes: [
			'Derivative Models for Risk Management · Regulation of Financial Institutions · Innovation in Financial Technologies'
		]
	},
	{
		meta: '2016 — 2020 · GPA 3.9',
		name: 'University of Waterloo',
		degree: 'Bachelor of Mathematics — Financial Analysis & Risk Management',
		notes: [
			"Dean's Honor List, 2016 — 2020",
			'Portfolio Optimization Models · Derivatives · Mathematical Statistics'
		]
	}
];

export const certs: Cert[] = [
	{
		issuer: 'CFA INSTITUTE · JAN 2025',
		title: 'CFA Program Level II',
		detail: 'CRED. 129967613',
		tone: 'amber'
	},
	{
		issuer: 'CFA INSTITUTE · AUG 2019',
		title: 'CFA Level I Exam',
		detail: 'PASSED',
		tone: 'amber'
	},
	{
		issuer: 'IB · MAY 2016',
		title: 'IB Bilingual Diploma',
		detail: 'INTERNATIONAL BACCALAUREATE',
		tone: 'cyan'
	},
	{ issuer: 'IB · MAY 2016', title: 'IB Diploma Program', detail: 'CRED. 38', tone: 'cyan' }
];

export const comms = {
	blurb: 'Based in Hong Kong SAR. Reachable for finance and risk roles, or a chat about mobile suits.',
	email: 'shiqiuliu1997@gmail.com',
	linkedin: 'https://www.linkedin.com/in/shiqiu-bill-liu'
};

export const footerLine = 'SHIQIU LIU · 2026 // ALL SYSTEMS GREEN';
