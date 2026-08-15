# Feature: Responsive layout

Viewports under test: phone 390×844 (portrait), design 1528×883 (the frame the design
was approved on), desktop 1920×1080 (where the prototype letterboxed badly).

## Happy paths

- Site (after skipping the intro) has no horizontal overflow at any tested viewport.
- Hero name and portrait placeholder are visible at every viewport.

## Edge cases

- During the film, the 16:9 box fits inside the viewport AND fills at least 90% of one
  axis (scales up on desktop; the natural-size letterbox bug must not regress).
- Standby panel fits the phone viewport without overflow.
