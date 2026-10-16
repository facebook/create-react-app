/**
 * The days a vehicle is already out, shown under the booking dates.
 *
 * <input type="date"> takes min, max and step and nothing else -- there is no
 * way to say "these particular days are gone", and no way to colour one. So
 * the days are drawn.
 *
 * The date boxes stay: whoever is on the phone to a customer types a date
 * faster than they page a calendar. The grid is what stops a clash being
 * discovered only on save, and typing a taken day is caught on the way out.
 *
 * Read from the same endpoint the public site uses, which reads
 * BLOCKING_STATUSES -- so this, the site and the check that refuses a double
 * booking cannot disagree about what "taken" means.
 */
(function () {
  'use strict';

  var DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  /**
   * How far back a day can still be chosen.
   *
   * The grid used to stop at today, which is right for a booking being taken
   * over the phone and wrong for the other half of what this form does:
   * writing down a hire that already happened. A car goes out, comes back, and
   * the paperwork is caught up at the end of the week -- and the days that
   * hire actually ran were greyed out.
   *
   * Nothing else was stopping it. The date boxes carry no min and the server
   * has no rule about it, so a past date typed by hand always saved. This only
   * ever blocked the clicking.
   *
   * A week rather than forever: far enough to catch up the week's paperwork,
   * near enough that a mistyped year does not quietly land a booking in 2019.
   * Days before it stay disabled, and the month arrows still page back as far
   * as anyone wants to look.
   */
  var BACKDATE_DAYS = 7;

  /** The earliest day the grid will let anyone click. */
  function earliestSelectable() {
    var d = new Date();
    d.setDate(d.getDate() - BACKDATE_DAYS);
    return iso(d);
  }
  var ranges = {};      // vehicle id -> [[from, to], ...]
  var loaded = false;

  function iso(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /** Every day in a range, inclusive. Capped like the server caps it. */
  function expand(from, to) {
    var out = [];
    var day = new Date(from + 'T00:00:00');
    var end = new Date(to + 'T00:00:00');
    for (var i = 0; i < 400 && day <= end; i++) {
      out.push(iso(day));
      day.setDate(day.getDate() + 1);
    }
    return out;
  }

  /**
   * The days this vehicle is out, minus the booking being edited.
   *
   * Without that exclusion, opening an existing booking would show its own
   * dates as unavailable and refuse to let you keep them.
   */
  function busyFor(vehicleId, excludeRange) {
    var list = ranges[String(vehicleId)] || [];
    var set = new Set();
    list.forEach(function (r) {
      if (excludeRange && r[0] === excludeRange[0] && r[1] === excludeRange[1]) return;
      expand(r[0], r[1]).forEach(function (d) { set.add(d); });
    });
    return set;
  }

  async function load() {
    if (loaded) return;
    loaded = true;
    try {
      var res = await fetch('api/public-availability.php', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error('the server answered ' + res.status);
      var body = await res.json();
      if (body && body.ok && body.vehicles) ranges = body.vehicles;
    } catch (err) {
      // Not shown. The grid simply marks nothing, the date boxes still work,
      // and the save still refuses a clash -- which is the old behaviour.
      console.info('[availability] could not read booked days: ' + (err && err.message));
    }
  }

  /** Draws one month into `host`, for `input`. */
  function draw(host, input, busy, month) {
    var today = iso(new Date());
    var earliest = earliestSelectable();
    var first = new Date(month.getFullYear(), month.getMonth(), 1);
    var count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    var lead = (first.getDay() + 6) % 7;

    var head = '<div class="cal-head">' +
      '<button type="button" class="cal-nav" data-step="-1" aria-label="Previous month">&#8249;</button>' +
      '<span>' + month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + '</span>' +
      '<button type="button" class="cal-nav" data-step="1" aria-label="Next month">&#8250;</button>' +
      '</div>';

    var names = '<div class="cal-names" aria-hidden="true">' +
      DAYS.map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>';

    var cells = '';
    for (var i = 0; i < lead; i++) cells += '<span class="cal-pad"></span>';
    for (var d = 1; d <= count; d++) {
      var date = new Date(month.getFullYear(), month.getMonth(), d);
      var key = iso(date);
      var out = busy.has(key);
      var past = key < earliest;
      // Backdated but still selectable: shown for what it is, so nobody
      // records last Tuesday's hire thinking they booked next Tuesday's.
      var back = !past && key < today;
      var on = key === input.value;
      cells += '<button type="button" class="cal-day' +
        (on ? ' is-on' : '') + (out ? ' is-busy' : '') + (back ? ' is-back' : '') + '"' +
        (out || past ? ' disabled' : '') +
        ' data-date="' + key + '"' +
        ' aria-label="' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) +
        (out ? ' — already booked' : '') + (back ? ' — a past date' : '') + '">' + d + '</button>';
    }

    host.innerHTML = head + names + '<div class="cal-grid">' + cells + '</div>' +
      '<p class="cal-key"><span class="cal-swatch" aria-hidden="true"></span>Already booked' +
      '<span class="cal-swatch cal-swatch-back" aria-hidden="true"></span>Past date</p>';

    host.querySelectorAll('.cal-nav').forEach(function (b) {
      b.addEventListener('click', function () {
        draw(host, input, busy, new Date(month.getFullYear(), month.getMonth() + Number(b.dataset.step), 1));
      });
    });
    host.querySelectorAll('.cal-day').forEach(function (b) {
      b.addEventListener('click', function () {
        input.value = b.dataset.date;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  /** Wires one date input to a calendar under it. */
  function attach(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return null;

    var host = document.createElement('div');
    host.className = 'cal';
    input.parentElement.appendChild(host);

    var warn = document.createElement('p');
    warn.className = 'cal-warn';
    warn.hidden = true;
    input.parentElement.appendChild(warn);

    return {
      input: input,
      render: function (busy, exclude) {
        var seed = input.value && !isNaN(Date.parse(input.value))
          ? new Date(input.value + 'T00:00:00')
          : new Date();
        draw(host, input, busy, new Date(seed.getFullYear(), seed.getMonth(), 1));

        var clash = input.value !== '' && busy.has(input.value);
        warn.hidden = !clash;
        warn.textContent = clash ? 'This vehicle is already booked that day.' : '';
        input.setAttribute('aria-invalid', clash ? 'true' : 'false');
        void exclude;
      },
    };
  }

  document.addEventListener('DOMContentLoaded', async function () {
    var start = attach('bkStartDate');
    var end = attach('bkReturnDate');
    var select = document.getElementById('bkVehicle');
    if (!start || !end || !select) return;

    await load();

    function refresh() {
      // The booking being edited must not block its own dates.
      var editing = document.getElementById('bookingId');
      var exclude = null;
      if (editing && editing.value && start.input.value && end.input.value) {
        exclude = [start.input.value, end.input.value];
      }
      var busy = busyFor(select.value, exclude);
      start.render(busy, exclude);
      end.render(busy, exclude);
    }

    select.addEventListener('change', refresh);
    start.input.addEventListener('change', refresh);
    end.input.addEventListener('change', refresh);

    // The modal is shown by clearing `hidden` rather than by an event, so the
    // calendar is redrawn when that attribute changes.
    var overlay = document.getElementById('bookingModalOverlay');
    if (overlay) {
      new MutationObserver(function () {
        if (!overlay.hidden) refresh();
      }).observe(overlay, { attributes: true, attributeFilter: ['hidden'] });
    }

    refresh();
  });
}());
