# Feature: Launch intro sequence

All scenarios run with `?fps=24` (silent synth reel, ~5s film) unless stated.

## Happy paths

- Landing on the page: standby dossier panel with INITIATE button, registry label, and frame-load percent is visible; page scroll is locked.
- Clicking INITIATE: ignite countdown appears (REEL 0083 // PICTURE START), then the film frame with REEL counter, then the site hero — with scroll unlocked.

## Edge cases

- SKIP INTRO from standby: site appears immediately, scroll unlocked.
- SKIP during film: film stops, site appears.
- REPLAY LAUNCH from the site header: standby panel returns, scroll locked again.
- Landing with `?intro=off` (share link): no overlay at all, site visible and scrollable,
  no music; REPLAY LAUNCH still runs the intro.

## User interactions

- All transitions are driven by real clicks on the visible buttons (no programmatic state calls).
- While the film plays, the frame counter advances over time.

## Error cases

- (Audio failures fall back to synth internally; not observable via e2e, covered by unit tests.)
