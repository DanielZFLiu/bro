# Feature: SEO metadata

Scenarios load the site through `?intro=off`, the share link, so the head is asserted on the
same URL crawlers and unfurlers are handed.

## Happy paths

- The page declares `https://bill-liu.com/` as canonical, so the `?intro=off` and `?fps=` variants
  collapse into one indexed URL instead of competing as duplicates.
- The page carries a schema.org Person block that parses as JSON, names Shiqiu Liu, and lists the
  LinkedIn profile under sameAs.
- `og:image` is absolute on the canonical origin: unfurlers do not resolve paths relative to the
  page, so a relative card URL would silently produce a blank preview.

## Edge cases

- `/sitemap.xml` is served with a 200 and lists the canonical URL.
- `/og.png` is served with a 200 and an `image/png` content type, so an unfurler that trusts the
  declared type gets an image it can decode.
