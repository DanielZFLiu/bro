const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ▚▞░▒▓/\\<>';

// Spaces resolve for free so the label never changes width mid-decode.
export function decodeKicker(
	target: string,
	progress: number,
	random: () => number = Math.random
): string {
	const resolved = Math.round(target.length * Math.min(1, Math.max(0, progress)));
	let out = '';
	for (let i = 0; i < target.length; i++) {
		const char = target[i];
		out += i < resolved || char === ' ' ? char : GLYPHS[Math.floor(random() * GLYPHS.length)];
	}
	return out;
}
