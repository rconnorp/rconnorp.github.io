/* Motion layer (GSAP). Pure progressive enhancement: if GSAP fails to load,
   or the visitor prefers reduced motion, nothing here runs and every word of
   the page is already visible. Effects only touch transform/opacity. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    root.classList.add('no-motion');
    root.classList.remove('hero-prehide');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add('motion-ready');

  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* Hero: name rises char by char, then the rest of the intro follows.
     The hero text carries a CSS parallax transform (main.js), so the follow-up
     items animate opacity and the independent `translate` property instead. */
  function heroIntro() {
    var name = document.querySelector('[data-split-chars]');
    var rest = all('.hero-eyebrow, .hero-sub, .hero-lead, .hero-cta');
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (name) {
      SplitText.create(name, {
        type: 'words,chars',
        mask: 'chars',
        wordsClass: 'hero-word',
        charsClass: 'hero-char',
        onSplit: function (self) {
          /* background-clip:text on the parent cannot paint through the split
             wrappers, so each char carries a slice of the same gradient. */
          var w = name.offsetWidth, left = name.getBoundingClientRect().left;
          self.chars.forEach(function (ch) {
            ch.style.backgroundSize = w + 'px 100%';
            ch.style.backgroundPosition = (-(ch.getBoundingClientRect().left - left)) + 'px 0';
          });
          tl.from(self.chars, { yPercent: 110, duration: 1.1, stagger: 0.025 }, 0.05);
          root.classList.remove('hero-prehide');
        }
      });
    }
    setTimeout(function () { root.classList.remove('hero-prehide'); }, 1500);
    var eyebrow = rest.filter(function (e) { return e.classList.contains('hero-eyebrow'); });
    var later = rest.filter(function (e) { return !e.classList.contains('hero-eyebrow'); });
    if (eyebrow.length) tl.fromTo(eyebrow, { opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0px', duration: 0.8 }, 0);
    if (later.length) {
      tl.fromTo(later, { opacity: 0, translate: '0 22px' },
        { opacity: 1, translate: '0 0px', duration: 0.9, stagger: 0.12, clearProps: 'opacity,translate' }, 0.55);
    }
  }

  /* Section headings and the Sunoco statement: lines rise out of a mask. */
  function headingReveals() {
    all('[data-split]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 100, duration: 0.9, ease: 'expo.out', stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          });
        }
      });
    });
  }

  /* Experience timeline: the rail fills as you scroll, dots light up. */
  function timelineDraw() {
    var wrap = document.querySelector('.timeline-wrap') || document.querySelector('[data-timeline]');
    var fill = document.querySelector('.tl-line-fill');
    if (wrap && fill) {
      gsap.fromTo(fill, { scaleY: 0, transformOrigin: 'top center' }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top 70%', end: 'bottom 70%', scrub: true }
      });
    }
    all('[data-timeline] .tl-item').forEach(function (item) {
      var dot = item.querySelector('.tl-dot');
      var card = item.querySelector('.tl-card');
      ScrollTrigger.create({
        trigger: item, start: 'top 65%',
        onEnter: function () { if (dot) dot.classList.add('is-active'); },
        onLeaveBack: function () { if (dot) dot.classList.remove('is-active'); }
      });
      if (card) {
        gsap.from(card, {
          opacity: 0, y: 28, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: item, start: 'top 85%', once: true }
        });
      }
    });
  }

  /* Off the clock tiles and deal tombstones: staggered entrance.
     Uses the `translate` property so it never fights the tombstone tilt. */
  function staggerTiles() {
    var els = all('.otc-tile, .tombstone');
    if (!els.length) return;
    gsap.set(els, { opacity: 0, translate: '0 24px' });
    ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, translate: '0 0px', duration: 0.8, ease: 'power3.out',
          stagger: 0.08, overwrite: true, clearProps: 'opacity,translate'
        });
      }
    });
  }

  /* Tombstones tilt toward the pointer and catch a sheen (desktop only). */
  function tombstoneTilt() {
    all('.tombstone[data-tilt]').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
      var ry = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });
      var sheen = gsap.quickTo(card, '--sheen', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 12);
        rx((0.5 - py) * 12);
        sheen(px);
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); sheen(0); });
    });
  }

  var mm = gsap.matchMedia();
  mm.add({
    reduce: '(prefers-reduced-motion: reduce)',
    desktop: '(min-width: 992px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 991.98px) and (prefers-reduced-motion: no-preference)'
  }, function (ctx) {
    var c = ctx.conditions;
    if (c.reduce) return;               /* everything stays static and visible */
    heroIntro();
    headingReveals();
    timelineDraw();
    staggerTiles();
    if (c.desktop) tombstoneTilt();
    /* Cursor spotlight on the dark chapter already lives in main.js (.work-spotlight). */
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
