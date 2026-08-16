import type { Action } from 'svelte/action';

// One-shot scroll entrance. The pending class lands only after mount, so prerendered and
// no-JS HTML is never left hidden.
export const reveal: Action = (node) => {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	node.classList.add('reveal-pending');
	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.replace('reveal-pending', 'reveal-in');
			observer.disconnect();
		},
		{ rootMargin: '0px 0px -12% 0px' }
	);
	observer.observe(node);

	return { destroy: () => observer.disconnect() };
};
