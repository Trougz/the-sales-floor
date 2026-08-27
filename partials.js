/* partials.js — shared site chrome (header + footer), injected client-side.
 *
 * Why this exists: this is a plain static site with no build step, and the
 * header/footer are iterated on constantly. Rather than hand-syncing the same
 * markup across every HTML file, each page drops in
 *   <div data-partial="header"></div>  /  <div data-partial="footer"></div>
 * and this script replaces those placeholders with the real markup on load.
 *
 * No fetch() is used (markup lives in the strings below), so this works when a
 * page is opened directly over file:// as well as from a static server.
 *
 * Every page still ships a <noscript> block with a plain static header/footer,
 * so the site is navigable with JavaScript disabled.
 */
(function () {
  'use strict';

  // Flame mark — single source of truth (was previously inlined in every file,
  // sometimes twice). Fill colour comes from CSS (.flame path { fill: ... }).
  var FLAME_SVG =
    '<svg class="flame" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M20 2C20 12 7 15 7 28C7 38 13 46 21 50C17 44 15 37 19 30C21 34 25 36 27 32C29 39 34 41 34 32C34 24 27 20 27 12C27 19 23 19 23 14C23 7 20 6 20 2Z" />' +
    '</svg>';

  // [href, label] — `active` is resolved per page from the URL in currentPath().
  var NAV_LINKS = [
    ['/for-talent', 'For Talent'],
    ['/for-companies', 'For Companies'],
    ['/about', 'About']
  ];
  var NAV_CTA = ['/candidates', 'Apply'];

  var FOOTER_LINKS = [
    ['/for-talent', 'For Talent'],
    ['/for-companies', 'For Companies'],
    ['/about', 'About'],
    ['/privacy', 'Privacy']
  ];
  // Social links are placeholders until real handles exist.
  var SOCIAL_LINKS = ['LinkedIn', 'YouTube', 'Instagram', 'TikTok'];

  // Normalise location.pathname to one of our clean route keys:
  //   "/", "/for-talent", "/candidates", "/privacy", ...
  // Tolerates trailing slashes and a ".html" extension, so the active state is
  // correct whether the page is served with clean URLs (GitHub Pages), with the
  // extension (python -m http.server), or opened straight off disk (file://).
  function currentPath() {
    var p = location.pathname.replace(/\/+$/, '');
    var last = (p.split('/').pop() || '').toLowerCase();
    if (last === '' || last === 'index' || last === 'index.html') return '/';
    return '/' + last.replace(/\.html$/, '');
  }

  function headerHtml(active) {
    var links = NAV_LINKS.map(function (item) {
      var on = item[0] === active;
      return (
        '<a href="' + item[0] + '" class="nav-btn' + (on ? ' active' : '') + '"' +
        (on ? ' aria-current="page"' : '') + '>' + item[1] + '</a>'
      );
    }).join('');

    return (
      '<header><nav>' +
        '<a href="/" class="logo">' + FLAME_SVG + 'The Sales Floor</a>' +
        '<button class="nav-toggle" type="button" aria-label="Open menu" ' +
          'aria-expanded="false" aria-controls="nav-menu">' +
          '<span class="nav-toggle__bar"></span>' +
          '<span class="nav-toggle__bar"></span>' +
          '<span class="nav-toggle__bar"></span>' +
        '</button>' +
        '<div class="nav-menu" id="nav-menu">' +
          links +
          '<a href="' + NAV_CTA[0] + '" class="btn btn--primary nav-cta">' + NAV_CTA[1] + '</a>' +
        '</div>' +
      '</nav></header>'
    );
  }

  function footerHtml() {
    var company = FOOTER_LINKS.map(function (i) {
      return '<a href="' + i[0] + '">' + i[1] + '</a>';
    }).join('');
    var social = SOCIAL_LINKS.map(function (name) {
      // href="#" + aria-disabled until real profiles are wired up.
      return '<a href="#" aria-disabled="true">' + name + '</a>';
    }).join('');

    return (
      '<footer class="site-footer"><div class="container">' +
        '<div class="site-footer__grid">' +
          '<div class="site-footer__brand">' +
            '<a href="/" class="logo">' + FLAME_SVG + 'The Sales Floor</a>' +
            '<p class="site-footer__tag">Sales recruiting, run by people who carried a bag.</p>' +
            '<a href="/employers" class="btn btn--ghost">Get in touch</a>' +
          '</div>' +
          '<div class="site-footer__col"><h4>Company</h4>' + company + '</div>' +
          '<div class="site-footer__col"><h4>Social</h4>' + social + '</div>' +
          '<div class="site-footer__col">' +
            '<h4>Stay in the loop</h4>' +
            '<form class="newsletter" novalidate>' +
              '<label for="nl-email" class="newsletter__label">Hiring insights and new roles, now and then.</label>' +
              '<div class="newsletter__row">' +
                '<input type="email" id="nl-email" name="email" placeholder="you@company.com" autocomplete="email" />' +
                '<button type="submit" class="btn btn--primary">Join</button>' +
              '</div>' +
              '<p class="newsletter__note">Placeholder — not connected to anything yet.</p>' +
            '</form>' +
          '</div>' +
        '</div>' +
        '<div class="site-footer__bottom">' +
          '<span>&copy; 2026 The Sales Floor. All rights reserved.</span>' +
          '<a href="/privacy">Privacy Policy</a>' +
        '</div>' +
      '</div></footer>'
    );
  }

  // Replace the placeholder element itself (not its innerHTML) so the injected
  // <header> ends up as a direct child of <body>. A wrapping <div> would become
  // the sticky header's containing block and break `position: sticky`.
  function swap(selector, html) {
    var el = document.querySelector(selector);
    if (!el) return;
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    el.replaceWith(tpl.content);
  }

  function inject() {
    var active = currentPath();
    swap('[data-partial="header"]', headerHtml(active));
    swap('[data-partial="footer"]', footerHtml());
    wireNav();
    wireNewsletter();
    initThemeDev();
  }

  /* ---- Mobile nav ---- */
  function wireNav() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on link tap, Escape, click-away, and when we grow back to desktop.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (
        toggle.getAttribute('aria-expanded') === 'true' &&
        !e.target.closest('.nav-menu') &&
        !e.target.closest('.nav-toggle')
      ) {
        setOpen(false);
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640) setOpen(false);
    });
  }

  /* ---- Newsletter (placeholder, no backend) ---- */
  function wireNewsletter() {
    var form = document.querySelector('.newsletter');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (!email || email.value.indexOf('@') === -1) {
        if (email) email.focus();
        return;
      }
      // TODO: there is no subscribe endpoint yet. This only fakes a confirmation
      // so the UI can be reviewed; nothing is sent or stored.
      form.innerHTML =
        '<p class="newsletter__ok">Thanks — noted. (Placeholder: this isn’t stored anywhere yet.)</p>';
    });
  }

  /* ---- Dev-only theme switcher ----
     Lets us eyeball alternate token sets ([data-theme="alt"] in tokens.css)
     without shipping anything to visitors: it only runs on localhost or when
     the URL carries ?themedev, so the production hostname is never themed and
     never shows the button. Choice persists in localStorage. */
  var THEMES = ['default', 'alt'];

  function applyTheme(name) {
    if (name && name !== 'default') {
      document.documentElement.setAttribute('data-theme', name);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function initThemeDev() {
    var host = location.hostname;
    var enabled =
      host === 'localhost' || host === '127.0.0.1' ||
      /[?&]themedev\b/.test(location.search);
    if (!enabled) return;

    var stored = null;
    try { stored = localStorage.getItem('tsf-theme'); } catch (e) {}
    var initial =
      new URLSearchParams(location.search).get('theme') || stored || 'default';
    if (THEMES.indexOf(initial) === -1) initial = 'default';
    applyTheme(initial);
    try { localStorage.setItem('tsf-theme', initial); } catch (e) {}

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-dev-toggle';
    btn.textContent = 'theme: ' + initial;
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'default';
      var next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
      applyTheme(next);
      try { localStorage.setItem('tsf-theme', next); } catch (e) {}
      btn.textContent = 'theme: ' + next;
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
