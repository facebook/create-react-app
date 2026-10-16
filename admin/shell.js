/**
 * The navigation drawer and the reminders bell.
 *
 * Kept out of admin.js because every admin page has the shell and only
 * dashboard.php has admin.js. The row of pills the drawer replaced needed no
 * script at all, which is why it stayed: it could show two of its six
 * destinations on a phone and the other four were reachable only by dragging.
 *
 * The bell is here for the same reason. A reminder that only exists on the
 * dashboard is one you do not see while you are doing anything else, which is
 * most of the time.
 */
(function () {
  'use strict';

  /**
   * What this account may do, as the shell published it.
   *
   * The server decides permission -- every page and every endpoint guards
   * itself. This is so the panel does not draw a button whose only outcome is
   * "You do not have permission to do that", and does not fetch what it will
   * be refused: a refusal is written to the audit log, and a dashboard that
   * asked for the month's expenses on every load was putting two of them
   * there each time a Counter Staff account signed in.
   */
  var ABLE = (function () {
    var meta = document.querySelector('meta[name="abilities"]');
    var list = (meta && meta.content ? meta.content : '').split(' ');
    var set  = {};
    for (var i = 0; i < list.length; i++) {
      if (list[i]) set[list[i]] = true;
    }
    return set;
  }());

  window.nsCan = function (ability) { return ABLE[ability] === true; };

  var side   = document.getElementById('nsSide');
  var scrim  = document.getElementById('nsScrim');
  var burger = document.getElementById('nsBurger');
  var close  = document.getElementById('nsClose');

  if (side && burger) setUpDrawer();

  function setUpDrawer() {

  function setOpen(open) {
    document.body.classList.toggle('ns-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    // Moving focus is the difference between a drawer and a decoration for
    // anyone not using a mouse.
    if (open && close) close.focus();
    else if (!open) burger.focus();
  }

  burger.addEventListener('click', function () {
    setOpen(!document.body.classList.contains('ns-open'));
  });
  if (close) close.addEventListener('click', function () { setOpen(false); });
  if (scrim) scrim.addEventListener('click', function () { setOpen(false); });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && document.body.classList.contains('ns-open')) setOpen(false);
  });

  // Choosing somewhere to go closes the drawer. On the dashboard the buttons
  // switch a panel without a page load, so nothing else would.
  side.addEventListener('click', function (ev) {
    if (ev.target.closest('.ns-item')) setOpen(false);
  });

  // A link from another page arrives as dashboard.php#bookings. The dashboard
  // opens the Dashboard panel by default, so without this the link would land
  // on the right page and the wrong panel.
  function routeToHash() {
    var wanted = (window.location.hash || '').replace('#', '').replace(/[^a-z]/g, '');
    // No hash means the dashboard, which is what a bare dashboard.php shows.
    // Back out of #finance and the hash empties, and without this line the
    // Finance panel would stay on screen while the address bar said otherwise.
    if (!wanted) wanted = 'dashboard';
    var entry = side.querySelector('.admin-tab[data-tab="' + wanted + '"]');
    // Already there: clicking again would re-run the panel's loaders for
    // nothing, and on Bookings that is a fetch per booking.
    if (entry && !entry.classList.contains('is-on')) entry.click();
  }

  // On DOMContentLoaded rather than now: this file is included before admin.js,
  // which is what binds the buttons, so clicking one at this point would do
  // nothing. Not window.load either -- admin.js can put an alert up while it
  // is still waiting, and a blocking dialog swallowed the click.
  document.addEventListener('DOMContentLoaded', routeToHash);

  // And on every change after that, which is the half that was missing.
  //
  // Setting location.hash on a page that is already open is a same-document
  // navigation: the browser changes the address bar and fires hashchange, and
  // that is all. Nothing was listening, so the three quick actions that work
  // by setting it -- Inquiries, All bookings, Finance -- moved the address bar
  // and left the Dashboard panel showing. The back button did the same
  // nothing, and so did any link to #bookings from elsewhere on the page.
  window.addEventListener('hashchange', routeToHash);

  }  // end of the drawer

  // ------------------------------------------------------------ the bell --
  //
  // What needs doing, in the bar, on every page. The same list the dashboard
  // shows under "Needs attention" -- built from one endpoint so the two can
  // never tell different stories about what is owed.

  var bell  = document.getElementById('nsBell');
  var panel = document.getElementById('nsBellPanel');
  var list  = document.getElementById('nsBellList');
  var count = document.getElementById('nsBellCount');
  var sub   = document.getElementById('nsBellSub');

  if (!bell || !panel) return;

  var FLAGS = { overdue: 'Overdue', soon: 'Soon', new: 'New' };

  // Reminder text is built from customer and vehicle names, which are typed by
  // strangers on a public form. It is escaped rather than trusted, the same
  // way the dashboard escapes it.
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function openPanel(open) {
    panel.hidden = !open;
    bell.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  bell.addEventListener('click', function (ev) {
    ev.stopPropagation();
    openPanel(panel.hidden);
  });
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest('.ns-bell-wrap')) openPanel(false);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !panel.hidden) { openPanel(false); bell.focus(); }
  });

  function drawBell(alerts) {
    // A public entry point now that the dashboard feeds it, so it does not
    // assume it was handed a list.
    alerts = Array.isArray(alerts) ? alerts : [];

    // The number is what is late or due, not the whole list. A new enquiry is
    // worth showing when the panel is open and is not something running late,
    // and counting it would put the bell permanently on.
    var pressing = alerts.filter(function (a) { return a.level !== 'new'; }).length;
    count.textContent = pressing || '';
    count.hidden = pressing === 0;
    bell.classList.toggle('is-lit', pressing > 0);

    if (!alerts.length) {
      sub.textContent = 'Nothing needs chasing';
      list.innerHTML = '<li class="ns-bell-empty">Nothing due, nothing overdue, '
        + 'no deposits left to return.</li>';
      return;
    }
    sub.textContent = pressing
      ? pressing + (pressing === 1 ? ' thing needs doing' : ' things need doing')
      : 'Nothing overdue';

    list.innerHTML = alerts.map(function (a) {
      var id = a.booking_id ? ' data-booking="' + a.booking_id + '"'
             : a.vehicle_id ? ' data-vehicle="' + a.vehicle_id + '"'
             : a.enquiry_id ? ' data-enquiry="' + a.enquiry_id + '"' : '';

      // A reminder somebody set is the one kind that can be finished from
      // here: there is nothing to look at, only something to tick off.
      var mine = a.kind === 'reminder';
      var row = '<button type="button" class="ns-bell-row is-' + esc(a.level) + '"' + id
        + (mine ? ' data-reminder="' + a.reminder_id + '"' : '')
        + (mine && !id ? ' data-noop="1"' : '') + '>'
        + '<span class="ns-bell-flag">' + (mine ? 'Mine' : (FLAGS[a.level] || '')) + '</span>'
        + '<span class="ns-bell-subject">' + esc(a.subject) + '</span>'
        + '<span class="ns-bell-msg">' + esc(a.message) + '</span>'
        + '</button>';

      if (mine && window.nsCan('reminder.edit')) {
        row += '<span class="ns-bell-tools">'
          + '<button type="button" class="ns-bell-tick" data-done="' + a.reminder_id + '"'
          + ' title="Mark as done" aria-label="Mark &ldquo;' + esc(a.subject) + '&rdquo; as done">'
          + '\u2713</button>'
          + '<button type="button" class="ns-bell-edit" data-edit="' + a.reminder_id + '"'
          + ' title="Change this reminder" aria-label="Change &ldquo;' + esc(a.subject) + '&rdquo;">'
          + '\u270E</button></span>';
      }
      return '<li' + (mine ? ' class="is-mine"' : '') + '>' + row + '</li>';
    }).join('');
  }

  // ------------------------------------------- reminders somebody set --
  //
  // The bell carries what the panel works out for itself. These are the other
  // half: the things only the person running the business knows are coming,
  // which otherwise live on a phone and are forgotten when it is in a pocket.

  var CSRF = document.querySelector('meta[name="csrf-token"]');
  CSRF = CSRF ? CSRF.content : '';

  var form    = document.getElementById('nsReminderForm');
  var overlay = document.getElementById('nsReminderOverlay');

  function post(action, body) {
    return fetch('api/reminders.php?action=' + action, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) throw new Error(data.message || 'That did not save.');
        return data;
      });
    });
  }

  // After any change the whole list is fetched again rather than patched in
  // place. A reminder ticked off can change what is overdue and what the count
  // says, and re-deriving it is one rule instead of three.
  function refresh() {
    return fetch('api/alerts.php', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data) drawBell(data.alerts || []); });
  }

  function openForm(reminder) {
    if (!overlay) return;
    form.reset();
    document.getElementById('nsReminderError').textContent = '';
    document.getElementById('nsReminderId').value = reminder ? reminder.id : '';
    document.getElementById('nsReminderTitle').textContent =
      reminder ? 'Change this reminder' : 'New reminder';
    if (reminder) {
      document.getElementById('nsReminderText').value = reminder.title || '';
      document.getElementById('nsReminderDate').value = reminder.due_on || '';
      document.getElementById('nsReminderTime').value = (reminder.due_at || '').slice(0, 5);
      document.getElementById('nsReminderNote').value = reminder.note || '';
    } else {
      // Today, because that is what most reminders are, and an empty date
      // field is one more thing to fill in before the thought is written down.
      document.getElementById('nsReminderDate').value = new Date()
        .toLocaleDateString('en-CA');
    }
    overlay.hidden = false;
    openPanel(false);
    document.getElementById('nsReminderText').focus();
  }

  function closeForm() { if (overlay) overlay.hidden = true; }

  // Only for an account that may set one. An Auditor is read-only, and was
  // still offered "+ Add" and a pencil on every reminder -- both of which
  // the server refuses.
  var addBtn = document.getElementById('nsBellAdd');
  if (addBtn) {
    if (window.nsCan('reminder.create')) {
      addBtn.addEventListener('click', function () { openForm(null); });
    } else {
      addBtn.hidden = true;
    }
  }

  if (overlay) {
    document.getElementById('nsReminderCancel').addEventListener('click', closeForm);
    // Clicking away from a half-written reminder asks before it throws it
    // away, the same as every other form in the panel. See dialog.js.
    nsModal.guard(overlay, closeForm);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err  = document.getElementById('nsReminderError');
      var save = document.getElementById('nsReminderSave');
      var id   = document.getElementById('nsReminderId').value;
      err.textContent = '';
      save.disabled = true;

      post('save', {
        id: id ? Number(id) : 0,
        title: document.getElementById('nsReminderText').value,
        due_on: document.getElementById('nsReminderDate').value,
        due_at: document.getElementById('nsReminderTime').value,
        note: document.getElementById('nsReminderNote').value,
      }).then(function () {
        closeForm();
        return refresh();
      }).catch(function (e) {
        err.textContent = e.message;
      }).then(function () { save.disabled = false; });
    });
  }

  // Clicking a reminder goes to the thing it is about. On the dashboard that
  // is a modal opening in place; anywhere else there is no modal to open, so
  // it navigates there and the dashboard opens it on arrival.
  list.addEventListener('click', function (ev) {
    var tick = ev.target.closest('[data-done]');
    if (tick) {
      tick.disabled = true;
      post('done', { id: Number(tick.dataset.done) })
        .then(refresh)
        .catch(function (e) { tick.disabled = false; nsDialog.tell(e.message, { title: 'That did not save' }); });
      return;
    }

    var pencil = ev.target.closest('[data-edit]');
    if (pencil) {
      fetch('api/reminders.php?action=list', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var want = Number(pencil.dataset.edit);
          var found = (data.open || []).find(function (r) { return r.id === want; });
          if (found) openForm(found);
        })
        .catch(function () { nsDialog.tell('Could not open that reminder.', { title: 'Reminders' }); });
      return;
    }

    var row = ev.target.closest('.ns-bell-row');
    if (!row) return;
    // A reminder about nothing in particular has nowhere to go; the tick and
    // the pencil beside it are the whole of what it does.
    if (row.dataset.noop) return;
    openPanel(false);
    var d = row.dataset;
    if (d.booking && window.openBookingDetail) window.openBookingDetail(Number(d.booking));
    else if (d.enquiry && window.openEnquiry) window.openEnquiry(Number(d.enquiry));
    else if (d.vehicle && window.openCarById) window.openCarById(Number(d.vehicle));
    else if (d.booking) window.location.href = 'dashboard.php?booking=' + d.booking + '#bookings';
    else if (d.enquiry) window.location.href = 'dashboard.php?enquiry=' + d.enquiry + '#inquiries';
    else if (d.vehicle) window.location.href = 'dashboard.php?vehicle=' + d.vehicle + '#cars';
  });

  // The dashboard fetches this list for its own "Needs attention" panel and
  // hands it over here, so the bell and the panel cannot disagree and the
  // endpoint -- which prices every open booking -- is called once, not twice.
  window.nsDrawBell = drawBell;

  if (!document.getElementById('alertsPanel')) {
    fetch('api/alerts.php', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data) drawBell(data.alerts || []); })
      .catch(function () {
        // Quiet on purpose. A red error in the bar reads as the panel being
        // broken, when all that failed is a list of things to chase.
        sub.textContent = 'Could not load reminders';
        list.innerHTML = '';
      });
  }
}());
