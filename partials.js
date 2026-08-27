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
    ['/candidates', 'For Candidates'],
    ['/employers', 'For Employers']
  ];

  // Normalise location.pathname to one of our clean route keys:
  //   "/", "/candidates", "/employers", "/privacy", ...
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
        '<div class="nav-links">' + links + '</div>' +
      '</nav></header>'
    );
  }

  var FOOTER_HTML =
    '<footer><p>&copy; 2026 The Sales Floor. All rights reserved. ' +
    '<a href="/privacy">Privacy Policy</a></p></footer>';

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
    swap('[data-partial="footer"]', FOOTER_HTML);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
