# bro

Personal profile site for Shiqiu (Bill) Liu with a Gundam launch-sequence intro: an
ink-style manga reel (120 frames from the 0083 catapult launch) synced to the clip's
audio, then a starfield dossier with experience, education, certifications, and contact.

Share link: append `?intro=off` to skip the intro and audio, though the frames and audio still
preload in the background so REPLAY LAUNCH is instant.

## Run

```bash
npm install
npm run dev        # dev server
npm test           # unit (vitest) + e2e (playwright)
npm run check      # svelte-kit sync + svelte-check
npm run lint       # prettier + eslint
```

## Deploy

Static SvelteKit build served by Cloudflare Workers:

```bash
npm run build
npm run preview    # wrangler dev against the built worker
npx wrangler deploy
```

## Where next

- `docs/design.md`: design system and UI/UX guide
- `docs/code-style.md`: code conventions
- `docs/commit-conventions.md`: commit format
