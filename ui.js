/* ui.js — generic, dependency-free enhancers for the marketing pages.
 *
 * Pages carry only data; this expands it:
 *   <div data-logos></div>                     -> scrolling logo marquee
 *   <div data-carousel="placements"></div>     -> snap carousel of cards
 *   <div data-carousel="testimonials"></div>   -> snap carousel of quotes
 *
 * No-ops when none of those hooks are present, so it is safe to load on
 * every page. Content comes from window.SITE_CONTENT (content.js), graphics
 * from window.Placeholders (placeholders.js).
 */
(function () {
  'use strict';

  var C = window.SITE_CONTENT || {};
  var P = window.Placeholders || {};
  var usedPlaceholders = false;

  // Resolve a dotted path against SITE_CONTENT, e.g. "pages.forTalent.title".
  function dig(obj, path) {
    return String(path).split('.').reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---- Logo marquee ---- */
  function buildLogos() {
    var hosts = document.querySelectorAll('[data-logos]');
    if (!hosts.length) return;
    var logos = C.logos || [];
    if (!logos.length) return;

    hosts.forEach(function (host) {
      var track = el('div', 'marquee__track');

      function addSet(hidden) {
        logos.forEach(function (logo) {
          var item = el('div', 'marquee__item');
          if (hidden) item.setAttribute('aria-hidden', 'true');
          if (typeof logo === 'string') {
            item.innerHTML = P.logoWordmark ? P.logoWordmark(logo) : esc(logo);
            usedPlaceholders = true;
          } else if (logo && logo.img) {
            item.innerHTML = '<img src="' + esc(logo.img) + '" alt="' + esc(logo.name || '') + '" />';
          } else {
            item.textContent = (logo && logo.name) || '';
          }
          track.appendChild(item);
        });
      }

      addSet(false);
      addSet(true); // duplicate set -> seamless translateX(-50%) loop

      host.classList.add('marquee');
      host.textContent = '';
      host.appendChild(track);
    });
  }

  /* ---- Card renderers, keyed by data-carousel value ---- */
  var RENDERERS = {
    placements: function (p) {
      if (P.avatarMonogram) usedPlaceholders = true;
      return el('article', 'placement-card',
        (P.avatarMonogram ? P.avatarMonogram(p.name, { size: 56 }) : '') +
        '<div class="placement-card__name">' + esc(p.name) + '</div>' +
        '<div class="placement-card__role">' + esc(p.role || '') + '</div>' +
        '<div class="placement-card__company">' + esc(p.company || '') + '</div>' +
        (p.note ? '<div class="placement-card__note">' + esc(p.note) + '</div>' : '')
      );
    },
    testimonials: function (t) {
      return el('figure', 'quote-card',
        '<blockquote class="quote-card__text">' + esc(t.quote) + '</blockquote>' +
        '<figcaption class="quote-card__by">' +
          '<span class="quote-card__name">' + esc(t.name) + '</span>' +
          '<span class="quote-card__title">' + esc(t.title || '') + '</span>' +
        '</figcaption>'
      );
    },
    _default: function (item) {
      return el('div', 'carousel__item', esc(typeof item === 'string' ? item : ''));
    }
  };

  /* ---- Carousel ---- */
  function buildCarousel(host) {
    var key = host.getAttribute('data-carousel');
    var items = C[key] || [];
    if (!items.length) return;

    var render = RENDERERS[key] || RENDERERS._default;

    var track = el('div', 'carousel__track');
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', host.getAttribute('data-label') || key);
    items.forEach(function (item) { track.appendChild(render(item)); });

    var prev = el('button', 'carousel__btn carousel__btn--prev', '&#8592;');
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous');
    var next = el('button', 'carousel__btn carousel__btn--next', '&#8594;');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next');
    var nav = el('div', 'carousel__nav');
    nav.appendChild(prev);
    nav.appendChild(next);

    host.classList.add('carousel');
    host.textContent = '';
    host.appendChild(track);
    host.appendChild(nav);

    function step(dir) {
      var first = track.children[0];
      if (!first) return;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var delta = first.getBoundingClientRect().width + gap;
      track.scrollBy({ left: dir * delta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });

    var raf = null;
    function sync() {
      raf = null;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    }
    function schedule() {
      if (raf == null) raf = requestAnimationFrame(sync);
    }
    track.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    sync();
  }

  function buildCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(buildCarousel);
  }

  /* ---- Text + list binding from content.js ----
     <h1 data-text="pages.forTalent.title"></h1>
     <div data-each="pages.forTalent.benefits">
       <template><div class="benefit"><h3>{{title}}</h3><p>{{body}}</p></div></template>
     </div>
  */
  function bindText() {
    document.querySelectorAll('[data-text]').forEach(function (node) {
      var val = dig(C, node.getAttribute('data-text'));
      if (typeof val === 'string') {
        node.textContent = val;
        usedPlaceholders = true;
      }
    });
  }

  function bindEach() {
    document.querySelectorAll('[data-each]').forEach(function (host) {
      var arr = dig(C, host.getAttribute('data-each'));
      var tpl = host.querySelector('template');
      if (!Array.isArray(arr) || !tpl) return;
      host.innerHTML = arr.map(function (item) {
        return tpl.innerHTML.replace(/\{\{(\w+)\}\}/g, function (_, k) {
          return esc(item[k] == null ? '' : item[k]);
        });
      }).join('');
      usedPlaceholders = true;
    });
  }

  function init() {
    bindText();
    bindEach();
    buildLogos();
    buildCarousels();
    if (usedPlaceholders) {
      console.warn(
        '[The Sales Floor] Placeholder content is rendering on this page ' +
        '(content.js / placeholders.js). Replace it before public launch.'
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
