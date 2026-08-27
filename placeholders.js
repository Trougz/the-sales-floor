/* placeholders.js — zero-asset stand-in graphics as inline SVG strings.
 *
 * Everything here draws with no binary files so the redesign renders fully
 * offline and there is nothing to commit under assets/. Swap for real art
 * later by changing the matching content.js entry to { img: '...' }.
 *
 *   Placeholders.avatarMonogram(name, { size })  -> initials chip
 *   Placeholders.logoWordmark(text)              -> monochrome wordmark box
 */
(function () {
  'use strict';

  // Muted, paper-toned avatar backgrounds; picked deterministically per name.
  var AVATAR_BG = ['#E7E3DC', '#E4E7E4', '#EAE2DD', '#E1E4EA', '#EBE4E0', '#E2E6E5'];

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).slice(0, 2);
    var s = parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
    return s || '?';
  }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function escText(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function escAttr(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function avatarMonogram(name, opts) {
    opts = opts || {};
    var size = opts.size || 64;
    var bg = AVATAR_BG[hash(String(name || '')) % AVATAR_BG.length];
    return (
      '<svg class="ph-avatar" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" ' +
        'role="img" aria-label="' + escAttr(name) + '">' +
        '<rect width="' + size + '" height="' + size + '" rx="' + (size / 2) + '" fill="' + bg + '"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
          'font-family="Barlow Condensed, sans-serif" font-style="italic" font-weight="900" ' +
          'font-size="' + Math.round(size * 0.42) + '" fill="#16171A">' + escText(initials(name)) + '</text>' +
      '</svg>'
    );
  }

  function logoWordmark(textRaw) {
    var text = String(textRaw || '').toUpperCase();
    var w = Math.max(96, text.length * 12 + 28);
    var h = 34;
    return (
      '<svg class="ph-logo" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" ' +
        'role="img" aria-label="' + escAttr(textRaw) + '">' +
        '<rect x="0.5" y="0.5" width="' + (w - 1) + '" height="' + (h - 1) + '" rx="6" ' +
          'fill="none" stroke="currentColor" stroke-opacity="0.3"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
          'font-family="Barlow Condensed, sans-serif" font-weight="700" letter-spacing="1.6" ' +
          'font-size="14" fill="currentColor">' + escText(text) + '</text>' +
      '</svg>'
    );
  }

  window.Placeholders = { avatarMonogram: avatarMonogram, logoWordmark: logoWordmark };
})();
