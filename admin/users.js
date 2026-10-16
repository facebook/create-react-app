/**
 * The permission grid on the "Add somebody" form.
 *
 * One job: when the role changes, the ticks change with it. Without this the
 * form shows Staff's nine permissions while the dropdown says Accounts, and
 * whichever the person reads is the one they will believe.
 *
 * The server does not trust this. It is handed abilities_for -- the role the
 * ticks were last drawn for -- and ignores the ticks entirely if that does not
 * match the role being saved. So with JavaScript off the form still creates a
 * correct account: the role's own standard, which is what a form that cannot
 * re-tick itself is honestly able to offer.
 *
 * ES5 on purpose, like the rest of the panel's scripts: this runs on whatever
 * phone is behind the counter.
 */
(function () {
  'use strict';

  var form = document.querySelector('form.u-new');
  if (!form) return;

  var data = document.getElementById('nsRoleStandards');
  var role = form.querySelector('select[name="role"]');
  var saysWhich = document.getElementById('uAbilitiesFor');
  var note = document.getElementById('uPermNote');
  if (!data || !role || !saysWhich) return;

  var standards;
  try {
    standards = JSON.parse(data.textContent || '{}');
  } catch (e) {
    return;   // Leave the server's rendering alone rather than guess at it.
  }

  var boxes = form.querySelectorAll('.u-perm-grid input[type="checkbox"]');

  function labelFor(slug) {
    var option = role.options[role.selectedIndex];
    // The option text is "Accounts — description"; the role's name is the part
    // before the dash, which is what the sentence needs.
    var text = option ? option.text.split('—')[0] : slug;
    return text.replace(/\s+$/, '') || slug;
  }

  function apply() {
    var slug = role.value;
    var granted = standards[slug] || [];
    var full = slug === 'super_admin';
    var i;

    for (i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      box.checked = full || granted.indexOf(box.value) !== -1;
      // A Super Admin has every permission by definition and the server
      // stores no exceptions for one, so the grid stops being a control and
      // says so instead of lying about being adjustable.
      box.disabled = full;
    }

    saysWhich.value = slug;

    if (!note) return;
    note.innerHTML = full
      ? 'A <strong>Super Admin</strong> can do everything in the panel, including this page. '
        + 'There is nothing to choose.'
      : 'Ticked is the standard for <strong>' + labelFor(slug) + '</strong>. Change any of them '
        + '&mdash; what is saved is the difference, so this account stays &ldquo;'
        + labelFor(slug) + ', with changes&rdquo; rather than becoming a copy of today&rsquo;s '
        + labelFor(slug) + ' that never moves again. A dot marks what is hard to undo.';
  }

  role.addEventListener('change', apply);

  // Not called on load: the server already rendered the ticks for the
  // selected role, and re-applying would only matter if a browser restored a
  // different role from a previous submission -- which it can, so check.
  if (role.value !== saysWhich.value) apply();
})();
