# PROJECT_STATUS — Portfolio Site

## What this is
Single-page personal portfolio for Connor Peterson at https://rconnorp.github.io/ (GitHub Pages, deploys from `main`). The live deliverable is `index.html` + `css/bootstrap-custom.css` + `js/main.js`. This folder IS its own git repo.

## Current state — "The Keynote" Apple redesign (2026-07-03/04, NOT yet committed or pushed)
The site was fully redesigned to a genuine Apple-product-page aesthetic via a 21-agent workflow (3 design concepts → 3-lens judge panel → synthesis → implementation → 5-dimension adversarial review → fixes), followed by live browser verification and scroll fixes. All changes sit uncommitted in the working tree on top of published commit `d9bd29b`. The live site still shows the OLD design until committed + pushed.

Design: keynote structure — dark hero stage (gradient "Connor Peterson." name reveal, "Building the models behind the movies."), light Focus section, dark pinned Work chapter (scroll-scrubbed $925,000,000 figure + metric spec row), light About (framed portrait), NEW dark Media section (IMAX $57 / 360% stats), light Resume, dark "One more thing" Contact, footnote footer. SF Pro system stack, blue-only accent (single pink→violet note in Media), noise-textured dark stages, glass nav that adapts light/dark per section.

## File inventory
- `index.html` — main single-page site (hero, Focus, Work, About, **Media (new)**, Resume, Contact, footer). `<head>` SEO/OG/JSON-LD preserved verbatim from published version. Current.
- `css/bootstrap-custom.css` — fully rewritten token system + section treatments; Bootstrap 5 CDN kept (grid classes load-bearing). Current.
- `js/main.js` — vanilla JS: nav, reveals, counters/scrub, parallax, scrollspy, contact mailto form, copy-email, **JS-driven anchor scrolling (new)**. Current.
- `about.html`, `contact.html`, `resume.html` — 15-line redirect stubs to index.html sections. Leave in place (inbound links).
- `PetersonConnor.pdf` — resume download. `favicon.svg`, `apple-touch-icon.png`, `img/`, `robots.txt`, `sitemap.xml` — supporting assets. `archive/` — historical.

## Decisions log
- 2026-06-25 — Polish pass published (commit `d9bd29b`): SEO/OG metadata, favicons, og.jpg, mailto contact form, copy-email button.
- 2026-07-03 — Full Apple redesign implemented (workflow). Owner choices on record: **headshot-only imagery** (hero is deliberately photo-free; headshot lives in About) and **alternating light/dark** sections. Resume content preserved verbatim.
- 2026-07-03 — 4 review findings fixed: 44px hamburger + footer social tap targets, reduced-motion visibility desync, will-change fan-out (now set per-frame in JS).
- 2026-07-04 — Anchor-scroll bug fixed after live browser testing:
  1. `body { overflow-x: hidden }` made body a scroll container that swallowed same-page anchor navigation → added `overflow-x: clip` override (`@supports` block).
  2. CSS `scroll-behavior: smooth` stalls on very tall pages in Chrome and then blocks ALL programmatic scrolling → removed; replaced with JS-driven anchor glide in `main.js` (350–700ms easeInOutQuad, scroll-margin aware, focus handoff for a11y, instant under reduced-motion/hidden tab, watchdog timer guarantees landing, user wheel/touch cancels).
  Verified in Chrome: all six nav anchors land correctly; zero console errors; $925M scrub, reveals, glass nav, light/dark sections all render as designed.

## Open items
- [ ] **Commit + push to publish** — awaiting Connor's go-ahead (user-Pages repo deploys from `main`).
- [ ] `img/og.jpg` still shows the old light hero — link previews (LinkedIn/iMessage) won't match the new dark design until regenerated (~1200×630 crop of the new hero).
- [ ] Mobile-width visual pass was only spot-checked (hamburger/dark-glass menu variant exists in CSS); worth a quick phone check after publish.

Last updated: 2026-07-04 (Apple redesign + scroll fixes, uncommitted)
