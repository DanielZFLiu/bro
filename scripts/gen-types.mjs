// Runs inside npm lifecycle hooks (prepare, build): stale build output would poison the
// generated types, and CI=1 keeps wrangler from prompting.
import { spawnSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.svelte-kit/cloudflare';
const entries = () => {
	try {
		return readdirSync(dir);
	} catch {
		return [];
	}
};

for (const entry of entries()) {
	rmSync(join(dir, entry), { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
}
try {
	rmSync(dir, { recursive: true, force: true });
} catch {
	// The dir node itself can be held as a process cwd on Windows; empty, it cannot
	// poison the types, so only leftover contents are fatal.
	if (entries().length) {
		console.error(`${dir} still has contents; close whatever is holding them and retry`);
		process.exit(1);
	}
}

const { status } = spawnSync('wrangler', ['types'], {
	stdio: 'inherit',
	shell: true,
	env: { ...process.env, CI: '1' }
});
process.exit(status ?? 1);
