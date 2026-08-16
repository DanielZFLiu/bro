# Feature: Site navigation and controls

## Happy paths

- Header anchor links scroll their section into view (MISSION LOG → Experience, COMMS → contact).
- Section rail links scroll their section into view and mark it as the current location; the
  first section is marked while the reader is still on the hero.
- Contact links carry the right targets: mailto for email, LinkedIn profile with new-tab attributes.
- Footer status line is visible at the page bottom.

## User interactions

- SND toggle on the standby panel flips its label between SND: ON and SND: OFF on click.
- SND toggle in the site header flips after skipping the intro to reach the site.
- Scroll cue latch: after reaching the site, the "▼ SCROLL FOR MISSION LOG" cue appears roughly
  2.8s later; a real scroll gesture past ~40px hides it, and scrolling back to the top does NOT
  bring it back (one-way latch until replay; the e2e test asserts the latch, not the replay reset).

## Edge cases

- Navigation happens by real clicks; sections are reached by scrolling, not URL rewrites.
- The section rail is desktop-only: it is hidden on the phone viewport, where the header nav
  is the only way through the sections.
