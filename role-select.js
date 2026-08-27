/* role-select.js — candidates page only.
 *
 * A row of "who am I" chips above the intake form that just preselect the
 * existing #title <select>. It never touches the submit path (script.js is
 * untouched); the form still sends title=<value> exactly as before.
 *
 * Also honours a ?role= query param (canonicalised against an allowlist) so
 * future deep links from the marketing pages can land on the right role.
 */
(function () {
  'use strict';

  var form = document.getElementById('intake-form');
  var titleSelect = document.getElementById('title');
  if (!form || !titleSelect) return;

  var chips = Array.prototype.slice.call(form.querySelectorAll('.role-chip'));
  if (!chips.length) return;

  // Only values that are real <option>s can be applied.
  var VALID = {};
  Array.prototype.forEach.call(titleSelect.options, function (o) {
    if (o.value) VALID[o.value] = true;
  });

  function reflect(role) {
    chips.forEach(function (chip) {
      var on = chip.getAttribute('data-role') === role;
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      chip.classList.toggle('is-selected', on);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var role = chip.getAttribute('data-role');
      if (!VALID[role]) return;
      titleSelect.value = role;
      titleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      reflect(role);
    });
  });

  // If the user edits the select directly, keep the chips honest.
  titleSelect.addEventListener('change', function () {
    reflect(titleSelect.value);
  });

  // ?role= deep link -> canonical <option> value.
  var ALIASES = {
    sdr: 'SDR',
    bdr: 'BDR',
    ae: 'AE',
    'sales manager': 'Sales Manager',
    manager: 'Sales Manager'
  };
  var param = new URLSearchParams(location.search).get('role');
  if (param) {
    var canon = ALIASES[param.trim().toLowerCase()];
    if (canon && VALID[canon]) {
      titleSelect.value = canon;
      reflect(canon);
    }
  }
})();
