# Feature: Site navigation and controls

## Happy paths

- Header anchor links scroll their section into view (MISSION LOG → Experience, COMMS → contact).
- Contact links carry the right targets: mailto for email, LinkedIn profile with new-tab attributes.
- Footer status line is visible at the page bottom.

## User interactions

- SND toggle on the standby panel flips its label between SND: ON and SND: OFF on click.
- SND toggle in the site header flips independently of how the intro was exited.
- Scroll cue latch: after reaching the site, the "▼ SCROLL FOR MISSION LOG" cue appears roughly
  2.8s later; a real scroll gesture past ~40px hides it, and scrolling back to the top does NOT
  bring it back (one-way latch until replay).

## Edge cases

- Navigation happens by real clicks; sections are reached by scrolling, not URL rewrites.
