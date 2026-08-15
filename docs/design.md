# Design Guide

How the site's look and motion are built, for anyone adding to it.

## System

```
tokens  src/styles/app.css @theme   ->  Tailwind utilities + var(--color-*, --font-*)
mixins  src/styles/mixins.scss      ->  mono-label, corner-brackets, breakpoints
motion  src/styles/motion.css       ->  global k* keyframes
```

- Colors and fonts exist only as tokens. No raw hex outside `src/styles/`, with two exceptions:
  the intro's deliberately monochrome film layer (`src/lib/launch/`) and the canvas starfield
  painter (`src/lib/starfield/sky.ts`), which paints outside CSS.
- Tailwind for simple layout and spacing in markup; component SCSS for geometry,
  motion, and anything with math.
- Fonts: Chakra Petch (display), IBM Plex Mono (labels and data), IBM Plex Sans (body).

## Dossier language

- Mono uppercase micro-labels with wide tracking carry the military-registry voice.
- Amber marks credentials and section indexes; cyan marks identity and interaction;
  mint marks live status.
- Cards: hairline border, translucent panel background, cyan corner brackets
  (`@include corner-brackets`).
- Numbered sections: `NN // TAG` label + display-font heading + hairline rule
  (`SectionHeading.svelte`).

## Intro

```
standby -> ignite -> film -> starrise -> reveal -> site
           (2s)     (~58s)   (4s)       (1.4s fade)
```

State machine: `src/lib/launch/sequence.ts`. The film is a 16:9 box that scales to
fill any viewport; SFX overlays size in container-query units. URL switches:
`?intro=off` (share link), `?fps=N` (test reel).

The real-reel audio path is verified by hand only: Playwright's bundled Chromium cannot
decode AAC, so the e2e suite drives the silent synth reel through `?fps=N`.

## Adding a section

Copy an existing component in `src/lib/sections/`, give it an id, put the copy in
`src/lib/profile.ts`, add the nav entry, reuse `SectionHeading` and the card mixins.
Keep type scales in `clamp()` and check 390px, 1528px, and 1920px widths.
