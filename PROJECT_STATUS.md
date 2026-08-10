# PROJECT_STATUS — Portfolio Site

## What this is
Single-page personal portfolio for Connor Peterson at https://rconnorp.github.io/ (GitHub Pages, deploys from `main`). The live deliverable is `index.html` + `css/bootstrap-custom.css` + `js/main.js`. This folder IS its own git repo.

## Current state — finance-first update (PUBLISHED 2026-08-10, commit `4878f2d`)
Live at https://rconnorp.github.io/ — verified deployed (new HTML, new PDF, and new og.jpg all serving). The July "Keynote" Apple redesign is intact; this pass re-anchored the narrative on Connor's investment work after a resume refresh. The site now leads with his three concurrent roles — Investment Analyst Intern at Hurley Investments, Head of Sales at HeyLily AI, and Videographer & Photographer at BYU's Sorensen Center — instead of the previous "Building the models behind the movies" film-first framing. Entertainment media remains a genuine thread (Media section and IMAX thesis untouched), not the headline. 

Design: keynote structure — dark hero stage (eyebrow "Equity Research × Entertainment Media", gradient "Connor Peterson." name reveal, "Doing the research. Making the calls."), light Focus section, dark pinned Work chapter (scroll-scrubbed $925,000,000 figure + metric spec row), light About (framed portrait), NEW dark Media section (IMAX $57 / 360% stats), light Resume, dark "One more thing" Contact, footnote footer. SF Pro system stack, blue-only accent (single pink→violet note in Media), noise-textured dark stages, glass nav that adapts light/dark per section.

## File inventory
- `index.html` — main single-page site (hero, Focus, Work, About, Media, Resume, Contact, footer). `<head>` SEO/OG/JSON-LD rewritten 2026-08-10 for the finance-first positioning (JSON-LD now carries `jobTitle` + `worksFor` for all three current roles). Current.
- `css/bootstrap-custom.css` — fully rewritten token system + section treatments; Bootstrap 5 CDN kept (grid classes load-bearing). Current.
- `js/main.js` — vanilla JS: nav, reveals, counters/scrub, parallax, scrollspy, contact mailto form, copy-email, **JS-driven anchor scrolling (new)**. Current.
- `about.html`, `contact.html`, `resume.html` — 15-line redirect stubs to index.html sections. Leave in place (inbound links).
- `PetersonConnor.pdf` — resume download, refreshed 2026-08-10 from /Users/connorpeterson/Documents/Resume/PetersonConnor.pdf. `favicon.svg`, `apple-touch-icon.png`, `img/` (og.jpg regenerated 2026-08-10 and referenced with ?v=2 query string in meta tags to bust social-scraper caches), `robots.txt`, `sitemap.xml` — supporting assets. `archive/` — historical.

## Decisions log
- 2026-06-25 — Polish pass published (commit `d9bd29b`): SEO/OG metadata, favicons, og.jpg, mailto contact form, copy-email button.
- 2026-07-03 — Full Apple redesign implemented (workflow). Owner choices on record: **headshot-only imagery** (hero is deliberately photo-free; headshot lives in About) and **alternating light/dark** sections. Resume content preserved verbatim.
- 2026-07-03 — 4 review findings fixed: 44px hamburger + footer social tap targets, reduced-motion visibility desync, will-change fan-out (now set per-frame in JS).
- 2026-07-04 — Anchor-scroll bug fixed after live browser testing:
  1. `body { overflow-x: hidden }` made body a scroll container that swallowed same-page anchor navigation → added `overflow-x: clip` override (`@supports` block).
  2. CSS `scroll-behavior: smooth` stalls on very tall pages in Chrome and then blocks ALL programmatic scrolling → removed; replaced with JS-driven anchor glide in `main.js` (350–700ms easeInOutQuad, scroll-margin aware, focus handoff for a11y, instant under reduced-motion/hidden tab, watchdog timer guarantees landing, user wheel/touch cancels).
  Verified in Chrome: all six nav anchors land correctly; zero console errors; $925M scrub, reveals, glass nav, light/dark sections all render as designed.
- 2026-08-10 — **Finance-first update published (`4878f2d`).** Resume refreshed (Hurley Investments + HeyLily AI added, Embarc Solutions removed, Sorensen and IMAX bullets reworded). Connor chose *evolution, not rework*: same Apple keynote design system, zero CSS/JS changes, no new sections. Hero tagline chosen from three candidates: **"Doing the research. Making the calls."**
- 2026-08-10 — **Three concurrent roles, not two.** Connor corrected mid-session that he still works at the Sorensen Center alongside Hurley and HeyLily. An adversarial reviewer independently caught the hero naming only two roles while About claimed three. Hero lead, a fourth hero-meta chip, the About bio, the "Three Roles, Right Now" fact tile, and JSON-LD `jobTitle`/`worksFor` now all agree on three. Any future edit must keep these six surfaces in sync.
- 2026-08-10 — **Pre-existing inaccuracy corrected.** The Resume section listed the role as "Pre-Business (Finance track)"; the actual resume says only "Pre-Business". The Resume section now mirrors the PDF exactly. The narrative "on track for a finance degree" wording was kept in the About bio, where it reads as forward-looking intent rather than a claim about a declared program.
- 2026-08-10 — **og.jpg regenerated** (1200×630, 69KB) as a dark keynote card matching the new hero. The card HTML was built in the session scratchpad and is NOT stored in the repo — a future regeneration must rebuild it from the hero tokens in `css/bootstrap-custom.css`. Meta tags reference `img/og.jpg?v=2`; bump to `?v=3` next time the card changes.
- 2026-08-10 — Anonymization preserved: the Leadership & Service item still reads "Volunteer Organization" and must never name the church, even though the PDF does.

## Open items
- [x] Commit + push — published 2026-07-04 as `89dce33`, deployment verified live.
- [x] `img/og.jpg` regenerated 2026-07-04 — 1200×630 dark keynote card (headless-Chrome render of a dedicated card matching the hero), live.
- [ ] Mobile-width visual pass was only spot-checked (hamburger/dark-glass menu variant exists in CSS); worth a quick phone check after publish.
- [ ] Two pre-existing low-severity issues found during browser verification (neither introduced by the 2026-08-10 update, neither blocking): (1) the anchor-scroll watchdog in `js/main.js` calls `window.scrollTo(0, endY)` without `behavior:'instant'`, so it can stall in a backgrounded/occluded tab — the exact case it was written to guard; (2) ~12px of horizontal scroll slack at mobile widths from Bootstrap `.row.g-5` negative margins vs `.container` padding in the About/Media/Contact rows, partially masked by the existing `overflow-x: clip` mitigation.
- [ ] Ask Hurley Investments whether publishing a personal IMAX price target is compatible with their outside-activity policy. Footnote 2 now reads "conducted on personal time — personal work, not affiliated with any employer, and not investment advice" as an interim mitigation.

Last updated: 2026-08-10 (finance-first update published, `4878f2d`)
