/* =====================================================
   Connor Peterson — Single-page Portfolio interactivity
   Vanilla JS, dependency-free. ONE passive scroll handler,
   rAF-coalesced (works even in backgrounded tabs).

   Motion language: decelerate-and-settle. Everything is
   transform/opacity only, a progressive enhancement
   (html.js gate), and fully reduced-motion safe.
   ===================================================== */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = rmQuery.matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mqDesktop = window.matchMedia('(min-width: 768px)');
  var motionOK = !reduceMotion && mqDesktop.matches;   // sticky/scrub/parallax only here

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutExpo(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }
  /* comma-grouped integers ($925,000,000); decimals keep toFixed */
  function fmt(n, decimals) { return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US'); }

  docEl.classList.toggle('motion-ok', motionOK);

  /* ---------- element handles ---------- */
  var nav        = document.getElementById('site-nav');
  var toggle     = document.getElementById('nav-toggle');
  var navLinks   = document.getElementById('nav-links');
  var heroEl     = document.querySelector('.hero');
  var cueEl      = document.querySelector('.scroll-cue');
  var workEl     = document.getElementById('work');
  var workTrack  = document.querySelector('.work-track');
  var workStage  = document.querySelector('.work-stage');
  var workSpot   = document.querySelector('.work-spotlight');
  var metricEls  = workEl ? Array.prototype.slice.call(workEl.querySelectorAll('.metric')) : [];
  var progressEl = document.querySelector('.nav-progress');
  var darkEls    = Array.prototype.slice.call(document.querySelectorAll('.hero, .sec-dark, .site-footer'));

  var revealEls    = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-scale, .reveal-soft'));
  var timerCounters = Array.prototype.slice.call(document.querySelectorAll('.stat-value[data-count-to]'));

  /* ---------- mobile nav toggle ---------- */
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- counters ---------- */
  function buildCounter(el) {
    if (el._num) return el._num;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = '';
    var num = document.createElement('span'); num.className = 'num';
    var unit = document.createElement('span'); unit.className = 'unit'; unit.textContent = suffix;
    el.appendChild(document.createTextNode(prefix));
    el.appendChild(num);
    el.appendChild(unit);
    el._num = num;
    return num;
  }

  function animateCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-count-to'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var num = buildCounter(el);
    if (reduceMotion || document.hidden) { num.textContent = fmt(target, decimals); return; }
    var duration = 1500, startTime = null;
    var step = function (ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      num.textContent = fmt(target * easeOutExpo(p), decimals);
      if (p < 1) requestAnimationFrame(step);
      else num.textContent = fmt(target, decimals);
    };
    requestAnimationFrame(step);
  }

  /* The $925M metric is scroll-scrubbed on desktop, timer-counted on mobile. */
  var dealEl = document.querySelector('[data-scrub]');
  var dealNum = null, dealTarget = 0;
  function setupDeal() {
    if (dealEl && motionOK && !dealNum) {
      dealNum = buildCounter(dealEl);
      dealTarget = parseFloat(dealEl.getAttribute('data-scrub'));
      dealNum.textContent = '0';
      timerCounters = timerCounters.filter(function (c) { return c !== dealEl; });
    }
  }
  setupDeal();

  /* Release GPU layers once a reveal finishes transitioning. */
  document.addEventListener('transitionend', function (e) {
    if (e.target.classList && e.target.classList.contains('is-visible')) e.target.style.willChange = '';
  });

  /* ---------- scrollspy map ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var spySections = [];
  spyLinks.forEach(function (link) {
    var sec = document.getElementById(link.getAttribute('href').slice(1));
    if (sec) spySections.push({ link: link, sec: sec });
  });

  /* =========================================================
     The single scroll-driven update — pure fn of scroll/rects
     ========================================================= */
  function check() {
    var vh = window.innerHeight || docEl.clientHeight;

    if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 10);

    /* pause the hero aurora + drop its layer once the hero is gone */
    if (heroEl) heroEl.classList.toggle('hero-offscreen', window.scrollY >= heroEl.offsetHeight);

    /* reveals — same-frame siblings auto-cascade via --reveal-i */
    if (revealEls.length) {
      var newly = [];
      for (var i = 0; i < revealEls.length; i++) {
        var r = revealEls[i].getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) newly.push(revealEls[i]);
      }
      newly.forEach(function (el, k) {
        el.style.setProperty('--reveal-i', k);
        /* promote a layer only for the element(s) about to animate;
           cleared again on transitionend — never a blanket promotion.
           Skipped under reduced motion: nothing transitions, so nothing
           would fire transitionend to release the layer. */
        if (!reduceMotion) {
          el.style.willChange = el.classList.contains('reveal') ? 'opacity, transform, filter' : 'opacity, transform';
        }
        el.classList.add('is-visible');
        var ix = revealEls.indexOf(el);
        if (ix >= 0) revealEls.splice(ix, 1);
      });
    }

    /* timer counters */
    for (var c = timerCounters.length - 1; c >= 0; c--) {
      var cr = timerCounters[c].getBoundingClientRect();
      if (cr.top < vh * 0.85 && cr.bottom > 0) {
        animateCount(timerCounters[c]);
        timerCounters.splice(c, 1);
      }
    }

    /* hero parallax (desktop, motion-ok, only over the first screen) */
    if (motionOK && heroEl && window.scrollY < heroEl.offsetHeight) {
      var navH = nav ? nav.offsetHeight : 48;
      var hp = clamp(window.scrollY / (heroEl.offsetHeight - navH), 0, 1);
      heroEl.style.setProperty('--hp', hp.toFixed(4));
      /* the cue fades to 0 by hp 0.25 — pull it out of click + tab order then */
      if (cueEl) {
        var faded = hp >= 0.25;
        cueEl.classList.toggle('cue-faded', faded);
        cueEl.setAttribute('aria-hidden', faded ? 'true' : 'false');
        if (faded) cueEl.setAttribute('tabindex', '-1'); else cueEl.removeAttribute('tabindex');
      }
    }

    /* WORK: pinned statement + scroll-scrubbed metrics */
    if (motionOK && workTrack && workStage) {
      var wr = workTrack.getBoundingClientRect();
      var denom = workTrack.offsetHeight - vh;
      var p = denom > 0 ? clamp(-wr.top / denom, 0, 1) : (wr.top <= 0 ? 1 : 0);
      workStage.style.setProperty('--p', p.toFixed(4));
      if (workEl) workEl.style.setProperty('--enter', clamp((vh - wr.top) / vh, 0, 1).toFixed(4));
      var active = p > 0 && p < 1;
      /* spec-row metrics resolve sequentially at p 0.70 / 0.76 / 0.82 / 0.88 */
      for (var m = 0; m < metricEls.length; m++) {
        var mp = clamp((p - (0.70 + m * 0.06)) / 0.12, 0, 1);
        var e = easeOutExpo(mp);
        metricEls[m].style.opacity = e.toFixed(3);
        metricEls[m].style.transform = 'translateY(' + ((1 - e) * 26).toFixed(1) + 'px)';
        metricEls[m].style.willChange = active ? 'transform, opacity' : '';
      }
      /* the $925,000,000 build: digits earned over p 0.22–0.72,
         quantized to 48 steps so they tick into place, never smear */
      if (dealNum) {
        var dp = clamp((p - 0.22) / 0.5, 0, 1);
        dp = Math.round(dp * 48) / 48;
        dealNum.textContent = fmt(dealTarget * easeOutExpo(dp), 0);
      }
    }

    /* nav goes dark while ANY dark chapter (hero, .sec-dark, footer) fills the nav band */
    if (nav && darkEls.length) {
      var nH = nav.offsetHeight, onDark = false;
      for (var d = 0; d < darkEls.length; d++) {
        var dr = darkEls[d].getBoundingClientRect();
        if (dr.top <= nH && dr.bottom > nH) { onDark = true; break; }
      }
      nav.classList.toggle('nav-on-dark', onDark);
    }

    /* slim scroll-progress rail */
    if (progressEl) {
      var prog = clamp(window.scrollY / ((docEl.scrollHeight - vh) || 1), 0, 1);
      progressEl.style.transform = 'scaleX(' + prog.toFixed(4) + ')';
    }

    /* scrollspy */
    if (spySections.length) {
      var mark = vh * 0.4, currentLink = null;
      for (var s = 0; s < spySections.length; s++) {
        var sr = spySections[s].sec.getBoundingClientRect();
        if (sr.top <= mark && sr.bottom > mark) currentLink = spySections[s].link;
      }
      if (currentLink) {
        spyLinks.forEach(function (l) { l.classList.remove('active'); });
        currentLink.classList.add('active');
      }
    }
  }

  /* ---------- rAF-coalesced scroll binding ---------- */
  if (!('requestAnimationFrame' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    timerCounters.forEach(animateCount);
  } else {
    var ticking = false;
    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { check(); ticking = false; });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', check);
    document.addEventListener('visibilitychange', check);

    var refreshMotion = function () {
      reduceMotion = rmQuery.matches;
      motionOK = !reduceMotion && mqDesktop.matches;
      docEl.classList.toggle('motion-ok', motionOK);
      if (motionOK) {
        setupDeal();   // mobile->desktop: arm the scrub if it wasn't built at load
      } else {
        // hand control back to CSS fallbacks
        metricEls.forEach(function (mm) { mm.style.opacity = ''; mm.style.transform = ''; mm.style.willChange = ''; });
        if (heroEl) heroEl.style.removeProperty('--hp');
        // desktop->mobile: re-arm the $925M counter for the timer path so it isn't stranded
        if (dealEl && dealNum) {
          dealNum = null;
          dealEl._num = null;
          delete dealEl.dataset.counted;
          dealEl.textContent = '';
          if (timerCounters.indexOf(dealEl) === -1) timerCounters.push(dealEl);
        }
      }
    };
    window.addEventListener('resize', function () { refreshMotion(); check(); });
    rmQuery.addEventListener('change', function () { refreshMotion(); check(); });
    check();
  }

  /* ---------- hero entrance hand-off ----------
     After the load-in animation, drop the .hero-anim classes so the
     scroll-parallax transforms can take over the same elements
     without fighting animation fill-mode. */
  if (!reduceMotion) {
    window.setTimeout(function () {
      document.querySelectorAll('.hero-anim').forEach(function (el) {
        el.classList.remove('hero-anim', 'd1', 'd2', 'd3', 'd4', 'd5');
      });
    }, 1650);   /* ships with the CSS delay ladder: d5 ends at 1.45s */
  }

  /* ---------- pointer lighting (desktop, fine pointer only) ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.feature-tile, .fact, .resume-item, .contact-link').forEach(function (card) {
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });

    if (workSpot && workStage) {
      var tx = 50, ty = 50, cx = 50, cy = 50, spotRaf = null;
      var lerp = function () {
        cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
        workSpot.style.setProperty('--mx', cx.toFixed(1) + '%');
        workSpot.style.setProperty('--my', cy.toFixed(1) + '%');
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) spotRaf = requestAnimationFrame(lerp);
        else spotRaf = null;
      };
      workEl.addEventListener('mousemove', function (ev) {
        var r = workStage.getBoundingClientRect();
        tx = clamp((ev.clientX - r.left) / r.width * 100, 0, 100);
        ty = clamp((ev.clientY - r.top) / r.height * 100, 0, 100);
        if (!spotRaf) spotRaf = requestAnimationFrame(lerp);
      });
    }
  }

  /* ---------- same-page anchor scrolling ----------
     JS-driven with a capped duration: CSS scroll-behavior:smooth stalls on
     very tall pages in Chrome (a stuck native animation then swallows every
     later scroll), and a fixed ~600ms glide feels right regardless of
     distance. Reduced-motion and no-rAF users get an instant jump. */
  (function () {
    var scrollAnim = null;
    var watchdog = null;
    var cancelAnim = function () {
      if (scrollAnim !== null) { window.cancelAnimationFrame(scrollAnim); scrollAnim = null; }
      if (watchdog !== null) { window.clearTimeout(watchdog); watchdog = null; }
    };
    window.addEventListener('wheel', cancelAnim, { passive: true });
    window.addEventListener('touchstart', cancelAnim, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) return;                    // unknown anchor: browser default
        e.preventDefault();
        cancelAnim();
        if (window.history && history.pushState) history.pushState(null, '', '#' + id);

        var margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
        var startY = window.scrollY;
        var maxY = (docEl.scrollHeight - window.innerHeight) || 0;
        var endY = clamp(target.getBoundingClientRect().top + startY - margin, 0, maxY);
        var settle = function () {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        };

        /* rAF doesn't tick in hidden tabs, so animate only when visible */
        if (rmQuery.matches || document.hidden || !('requestAnimationFrame' in window)) {
          window.scrollTo(0, endY);
          settle();
          return;
        }
        var dist = endY - startY;
        var duration = clamp(Math.abs(dist) * 0.1, 350, 700);
        var t0 = null;
        var step = function (ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / duration, 1);
          var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;  // easeInOutQuad
          window.scrollTo(0, startY + dist * eased);
          if (p < 1) { scrollAnim = requestAnimationFrame(step); }
          else { cancelAnim(); settle(); }
        };
        scrollAnim = requestAnimationFrame(step);
        /* rAF only ticks while the page is actually rendering (an occluded
           window stops it mid-flight) — guarantee the landing regardless */
        watchdog = window.setTimeout(function () {
          if (scrollAnim !== null) { cancelAnim(); window.scrollTo(0, endY); settle(); }
        }, duration + 300);
      });
    });
  })();

  /* ---------- current year ---------- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- contact form → opens a pre-filled email (no backend) ----------
     Pure client-side: builds a mailto: with the visitor's name, email, and
     message, and opens their mail app. No server, no third-party service.
     Native field validation (required) runs before this handler fires. */
  var cform = document.getElementById('contact-form');
  var cstatus = document.getElementById('form-status');
  var CONTACT_EMAIL = 'rconnor.p28@gmail.com';
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var field = function (n) {
        var el = cform.querySelector('[name="' + n + '"]');
        return el && el.value ? el.value.trim() : '';
      };
      var name = field('name'), email = field('email');
      var subject = field('subject') || ('Portfolio inquiry' + (name ? ' from ' + name : ''));
      var message = field('message').replace(/\r\n|\r|\n/g, '\r\n');  // normalize line endings
      var body = [
        message,
        '',
        '---',
        'From: ' + (name || '(not provided)'),
        'Reply to: ' + (email || '(not provided)')
      ].join('\r\n');

      if (!message) {
        if (cstatus) {
          cstatus.textContent = 'Please add a message before sending.';
          cstatus.className = 'form-status err';
        }
        return;
      }

      var href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      // mailto: links can be silently truncated past ~2000 chars (Outlook/Windows).
      if (href.length > 1900) {
        if (cstatus) {
          cstatus.textContent = 'That message is a little long to open in an email app. Please shorten it, or email ' + CONTACT_EMAIL + ' directly.';
          cstatus.className = 'form-status err';
        }
        return;
      }

      if (cstatus) {
        cstatus.textContent = 'Opening your email app… if nothing happens, email ' + CONTACT_EMAIL + ' directly.';
        cstatus.className = 'form-status';
      }
      window.location.href = href;
    });
  }

  /* ---------- copy-email button (works for everyone, no mail app needed) ---------- */
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (err) { return false; }
  }

  document.querySelectorAll('[data-copy-email]').forEach(function (btn) {
    var label = btn.querySelector('.contact-copy-text');
    var resetTimer = null;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var email = btn.getAttribute('data-copy-email');
      var confirm = function () {
        if (label) label.textContent = 'Copied!';
        btn.classList.add('is-copied');
        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          if (label) label.textContent = 'Copy';
          btn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(confirm, function () {
          if (legacyCopy(email)) confirm();
        });
      } else if (legacyCopy(email)) {
        confirm();
      }
    });
  });

})();
