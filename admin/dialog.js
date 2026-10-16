/**
 * The panel's own dialogs, in place of the browser's.
 *
 * alert(), confirm() and prompt() were still doing most of the asking here.
 * They are quick to write and wrong in every other way: the box is pinned to
 * the top of the window rather than the middle of it, it is drawn in the
 * browser's furniture rather than the panel's, and it announces itself as
 * "admin.niteshacars.in says" -- which reads to anyone who has met a
 * malicious website as exactly that. A panel that handles a business's money
 * should not look like a pop-up ad when it has something to say.
 *
 * There was already one proper dialog here, the one that asks before
 * something is deleted, and it was the right shape: centred, in the panel's
 * card, with room for the detail a one-line question cannot carry. This is
 * that dialog generalised, so every question the panel asks is asked the same
 * way:
 *
 *   nsDialog.tell(text, opts)             instead of alert()
 *   nsDialog.confirm(text, opts)          instead of confirm()
 *   nsDialog.ask(text, opts)              instead of prompt()
 *   nsDialog.choose(text, choices, opts)  for a prompt that wanted one of a list
 *   nsDialog.form(fields, opts)           for the several-field edits
 *
 * form() is the one the native three never had. Correcting a payment means an
 * amount, a date, a method and a reason, and asking for those as four
 * questions one after another is four chances to lose your place -- and it
 * stops you seeing, while you type the new figure, what the old one was.
 *
 * All four return a promise, which is the real cost of the change: the native
 * three stop the world and these do not, so every caller has to await. That
 * is also the point. A blocking dialog freezes the page it is drawn over,
 * including anything the panel was in the middle of saving.
 *
 * ES5-flavoured, like the rest of the panel's scripts: this runs on whatever
 * phone is behind the counter.
 */
(function () {
  'use strict';

  /** The one on screen, and anything asked for while it is. */
  var showing = null;
  var waiting = [];

  var dom = null;

  /** Built once, on first use, so a page that never asks anything pays nothing. */
  function build() {
    if (dom) return dom;

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay ns-dialog';
    // Named, because tests and anything else that needs to find the question
    // on screen should not have to know how it is drawn.
    overlay.id = 'nsDialog';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="modal modal-confirm" role="alertdialog" aria-modal="true"'
      + ' aria-labelledby="nsDialogTitle" aria-describedby="nsDialogBody">'
      + '<h3 id="nsDialogTitle"></h3>'
      + '<div id="nsDialogBody" class="confirm-lead"></div>'
      + '<ul class="confirm-points"></ul>'
      + '<div class="ns-dialog-field" hidden>'
      + '<label for="nsDialogInput"></label>'
      + '<input id="nsDialogInput" type="text" autocomplete="off" />'
      + '<select id="nsDialogSelect" hidden></select>'
      + '</div>'
      + '<div class="ns-dialog-form" hidden></div>'
      + '<p class="confirm-final" hidden></p>'
      + '<p class="ns-dialog-error" hidden></p>'
      + '<div class="modal-actions">'
      + '<button type="button" class="btn btn-ghost" data-ns="cancel">Cancel</button>'
      + '<button type="button" class="btn btn-primary" data-ns="go">OK</button>'
      + '</div></div>';
    document.body.appendChild(overlay);

    dom = {
      overlay: overlay,
      card: overlay.querySelector('.modal'),
      title: overlay.querySelector('#nsDialogTitle'),
      body: overlay.querySelector('#nsDialogBody'),
      points: overlay.querySelector('.confirm-points'),
      field: overlay.querySelector('.ns-dialog-field'),
      form: overlay.querySelector('.ns-dialog-form'),
      label: overlay.querySelector('.ns-dialog-field label'),
      input: overlay.querySelector('#nsDialogInput'),
      select: overlay.querySelector('#nsDialogSelect'),
      final: overlay.querySelector('.confirm-final'),
      error: overlay.querySelector('.ns-dialog-error'),
      cancel: overlay.querySelector('[data-ns="cancel"]'),
      go: overlay.querySelector('[data-ns="go"]'),
    };

    dom.cancel.addEventListener('click', function () { settle(null); });
    dom.go.addEventListener('click', submit);
    // Only a press that starts and ends on the backdrop counts. Without the
    // first half, selecting text in the dialog and releasing outside it closes
    // the dialog and throws the answer away.
    var fromBackdrop = false;
    overlay.addEventListener('pointerdown', function (e) { fromBackdrop = e.target === overlay; });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && fromBackdrop) settle(null);
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); settle(null); return; }
      if (e.key === 'Enter' && showing && showing.spec.kind !== 'confirm'
          && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === 'Tab') trapTab(e);
    });

    return dom;
  }

  /** Keeps Tab inside the dialog, which is what aria-modal promises. */
  function trapTab(e) {
    var able = dom.card.querySelectorAll('button, input, select, textarea, a[href]');
    var live = [];
    for (var i = 0; i < able.length; i++) {
      if (!able[i].disabled && able[i].offsetParent !== null) live.push(able[i]);
    }
    if (!live.length) return;
    var first = live[0];
    var last = live[live.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /**
   * Text as the caller wrote it.
   *
   * These messages come from the panel's own code and from the server's error
   * strings, and both use blank lines to separate paragraphs and single ones
   * to list things. Set as text rather than HTML: an error message quoting a
   * customer's name is not markup, and the one place that does want markup
   * (the delete dialog's lead) says so.
   */
  function paragraphs(into, text, asHtml) {
    into.innerHTML = '';
    if (!text) return;
    if (asHtml) { into.innerHTML = text; return; }
    String(text).split(/\n{2,}/).forEach(function (chunk) {
      var p = document.createElement('p');
      chunk.split('\n').forEach(function (line, i) {
        if (i) p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode(line));
      });
      into.appendChild(p);
    });
  }

  function render(spec) {
    build();
    dom.title.textContent = spec.title;
    paragraphs(dom.body, spec.body, spec.bodyIsHtml);
    dom.body.hidden = !spec.body;

    dom.points.innerHTML = '';
    (spec.points || []).forEach(function (point) {
      var li = document.createElement('li');
      li.innerHTML = point;        // written in this codebase, not by a visitor
      dom.points.appendChild(li);
    });

    dom.final.hidden = !spec.footnote;
    dom.final.textContent = spec.footnote || '';

    dom.error.hidden = true;
    dom.error.textContent = '';

    var wantsInput = spec.kind === 'ask' || spec.kind === 'choose';
    dom.field.hidden = !wantsInput;
    if (wantsInput) {
      dom.label.textContent = spec.label || '';
      dom.label.hidden = !spec.label;
      var choosing = spec.kind === 'choose';
      dom.input.hidden = choosing;
      dom.select.hidden = !choosing;
      dom.label.setAttribute('for', choosing ? 'nsDialogSelect' : 'nsDialogInput');
      if (choosing) {
        dom.select.innerHTML = '';
        (spec.choices || []).forEach(function (choice) {
          var option = document.createElement('option');
          option.value = choice.value;
          option.textContent = choice.label;
          dom.select.appendChild(option);
        });
        dom.select.value = spec.value || (spec.choices[0] && spec.choices[0].value) || '';
      } else {
        dom.input.type = spec.type || 'text';
        dom.input.value = spec.value == null ? '' : String(spec.value);
        dom.input.placeholder = spec.placeholder || '';
        if (spec.inputMode) dom.input.inputMode = spec.inputMode;
        else dom.input.removeAttribute('inputmode');
      }
    }

    dom.form.hidden = spec.kind !== 'form';
    if (spec.kind === 'form') drawForm(spec);

    dom.cancel.hidden = spec.kind === 'tell';
    dom.cancel.textContent = spec.cancelLabel || 'Cancel';
    dom.go.textContent = spec.confirmLabel || (spec.kind === 'tell' ? 'OK' : 'Continue');
    dom.go.className = 'btn ' + (spec.tone === 'danger' ? 'btn-danger ns-dialog-danger' : 'btn-primary');

    dom.overlay.hidden = false;

    // What the keyboard lands on says what the dialog expects. A question
    // with a box wants the box; a destructive one wants Cancel, because the
    // reflex press of space on a dialog that just appeared should not delete
    // anything.
    var land = wantsInput
      ? (spec.kind === 'choose' ? dom.select : dom.input)
      : (spec.tone === 'danger' ? dom.cancel : dom.go);
    if (spec.kind === 'form') land = dom.form.querySelector('input, select, textarea') || dom.go;
    land.focus();
    if (land === dom.input || (land.tagName === 'INPUT' && land.type !== 'date')) {
      try { land.select(); } catch (e) { /* a type that cannot be selected */ }
    }
  }

  /**
   * The fields of a form dialog.
   *
   * Rebuilt each time rather than kept and reused: these dialogs differ by
   * one or two fields, and a stale control left behind from the last one is
   * the kind of fault nobody finds until somebody corrects the wrong figure.
   */
  function drawForm(spec) {
    dom.form.innerHTML = '';
    spec.fields.forEach(function (f, i) {
      var id = 'nsField' + i;
      var wrap = document.createElement('div');
      // A short field sits beside its neighbour where there is room. See
      // .ns-dialog-form in admin.css.
      wrap.className = 'ns-dialog-field' + (f.half ? ' is-half' : '');

      if (f.label) {
        var label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = f.label;
        wrap.appendChild(label);
      }

      var control;
      if (f.type === 'select') {
        control = document.createElement('select');
        (f.options || []).forEach(function (opt) {
          var option = document.createElement('option');
          option.value = opt.value === undefined ? opt : opt.value;
          option.textContent = opt.label === undefined ? opt : opt.label;
          control.appendChild(option);
        });
      } else if (f.type === 'textarea') {
        control = document.createElement('textarea');
        control.rows = f.rows || 3;
      } else {
        control = document.createElement('input');
        control.type = f.type || 'text';
        control.autocomplete = 'off';
        if (f.step) control.step = f.step;
        if (f.inputMode) control.inputMode = f.inputMode;
      }
      control.id = id;
      control.value = f.value == null ? '' : String(f.value);
      if (f.placeholder) control.placeholder = f.placeholder;
      control.setAttribute('data-name', f.name);
      wrap.appendChild(control);

      // What the figure is now, under the box that changes it. The whole
      // reason to show a form rather than ask a question at a time.
      if (f.hint) {
        var hint = document.createElement('p');
        hint.className = 'ns-dialog-hint';
        hint.textContent = f.hint;
        wrap.appendChild(hint);
      }
      dom.form.appendChild(wrap);
    });
  }

  /** What the form says now, as {name: value}. */
  function formValues() {
    var out = {};
    var controls = dom.form.querySelectorAll('[data-name]');
    for (var i = 0; i < controls.length; i++) {
      out[controls[i].getAttribute('data-name')] = controls[i].value;
    }
    return out;
  }

  function submit() {
    if (!showing) return;
    var spec = showing.spec;

    if (spec.kind === 'tell') { settle(undefined); return; }
    if (spec.kind === 'confirm') { settle(true); return; }

    if (spec.kind === 'form') {
      var values = formValues();
      var wrong = null;
      var culprit = null;
      spec.fields.forEach(function (f, i) {
        if (wrong) return;
        var value = values[f.name];
        if (f.required && !String(value).trim()) {
          wrong = (f.label || 'This') + ' is needed before we can save.';
        } else if (f.validate) {
          wrong = f.validate(value, values) || null;
        }
        if (wrong) culprit = dom.form.querySelectorAll('[data-name]')[i];
      });
      if (!wrong && spec.validate) wrong = spec.validate(values) || null;
      if (wrong) {
        dom.error.textContent = wrong;
        dom.error.hidden = false;
        if (culprit) culprit.focus();
        return;
      }
      settle(values);
      return;
    }

    var value = spec.kind === 'choose' ? dom.select.value : dom.input.value;
    var complaint = spec.validate ? spec.validate(value) : null;
    if (!complaint && spec.required && !String(value).trim()) {
      complaint = 'This one is needed before we can go on.';
    }
    if (complaint) {
      dom.error.textContent = complaint;
      dom.error.hidden = false;
      (spec.kind === 'choose' ? dom.select : dom.input).focus();
      return;
    }
    settle(value);
  }

  /** Answers the caller, puts the focus back, and starts the next one. */
  function settle(answer) {
    if (!showing) return;
    var done = showing;
    showing = null;
    dom.overlay.hidden = true;

    if (done.returnTo && document.contains(done.returnTo)) {
      try { done.returnTo.focus(); } catch (e) { /* gone from the page */ }
    }
    done.resolve(answer);

    if (waiting.length) next(waiting.shift());
  }

  function next(job) {
    showing = job;
    render(job.spec);
  }

  function show(spec) {
    return new Promise(function (resolve) {
      var job = { spec: spec, resolve: resolve, returnTo: document.activeElement };
      if (showing) waiting.push(job);
      else next(job);
    });
  }

  /** Lets a caller pass either a message or a whole specification. */
  function spec(kind, message, opts) {
    var o = opts || {};
    var out = {
      kind: kind,
      title: o.title || (kind === 'tell' ? 'NiteSha Admin' : 'Are you sure?'),
      body: o.body == null ? message : o.body,
      bodyIsHtml: !!o.bodyIsHtml,
      points: o.points,
      footnote: o.footnote,
      tone: o.tone,
      confirmLabel: o.confirmLabel,
      cancelLabel: o.cancelLabel,
    };
    // For a question with a box, the message reads better as the box's label
    // than as a paragraph above an unlabelled field.
    if (kind === 'ask' || kind === 'choose') {
      out.label = o.label == null ? message : o.label;
      out.body = o.body == null ? '' : o.body;
      out.value = o.value;
      out.placeholder = o.placeholder;
      out.type = o.type;
      out.inputMode = o.inputMode;
      out.required = o.required;
      out.validate = o.validate;
      out.confirmLabel = o.confirmLabel || 'Save';
      out.title = o.title || 'One more thing';
    }
    return out;
  }

  window.nsDialog = {
    /** Says something. Resolves when it has been read. */
    tell: function (message, opts) {
      return show(spec('tell', message, opts));
    },
    /** Asks. Resolves true only if the confirming button was pressed. */
    confirm: function (message, opts) {
      return show(spec('confirm', message, opts)).then(function (a) { return a === true; });
    },
    /** Asks for a line of text. Resolves null if it was cancelled. */
    ask: function (message, opts) {
      return show(spec('ask', message, opts));
    },
    /**
     * Asks for several things at once. Resolves an object of the values, or
     * null if it was cancelled.
     *
     * Each field is {name, label, type, value, hint, required, validate}.
     * type is text, number, date, select (with options) or textarea.
     */
    form: function (fields, opts) {
      var o = opts || {};
      var s = spec('form', '', o);
      s.fields = fields || [];
      s.validate = o.validate;
      s.confirmLabel = o.confirmLabel || 'Save';
      s.title = o.title || 'Edit';
      return show(s);
    },
    /** Asks for one of a list. Resolves null if it was cancelled. */
    choose: function (message, choices, opts) {
      var o = opts || {};
      o.choices = choices;
      var s = spec('choose', message, o);
      s.choices = choices;
      return show(s);
    },
  };

  /**
   * Forms and buttons that used to carry onsubmit="return confirm(...)".
   *
   * An inline handler cannot wait for a promise, so those are written as
   * data-confirm now and caught here: the first submit is stopped, the
   * question is asked, and the form is sent again from the answer. The flag
   * is what stops the second submit from asking all over again.
   */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.dataset || !form.dataset.confirm || form.dataset.nsConfirmed) return;
    e.preventDefault();
    window.nsDialog.confirm(form.dataset.confirm, {
      tone: form.dataset.confirmTone || 'danger',
      confirmLabel: form.dataset.confirmLabel || 'Delete',
      title: form.dataset.confirmTitle || 'Are you sure?',
    }).then(function (yes) {
      if (!yes) return;
      form.dataset.nsConfirmed = '1';
      // requestSubmit so the button that was pressed, and any validation,
      // still count -- form.submit() skips both.
      if (form.requestSubmit) form.requestSubmit();
      else form.submit();
      // Cleared again once that submit has been dispatched. Usually the page
      // is on its way somewhere else and it makes no difference; when the
      // submit is refused -- by validation, or by a handler of its own --
      // the form has to ask again next time rather than go straight through.
      delete form.dataset.nsConfirmed;
    });
  }, true);

  /**
   * The panel's form modals, and the click that used to throw them away.
   *
   * Every one of them closed on a click anywhere outside the card. On a
   * booking form that is twenty fields and several minutes of typing, and a
   * press that lands an inch wide of the card -- or a drag that starts on a
   * field and ends on the grey -- emptied all of it with nothing asked and
   * nothing kept. The owner reported doing it two or three times in a row.
   *
   * Three things close that hole:
   *
   *   The press has to start and end on the backdrop. Selecting text in a
   *   field and releasing outside the card is not a press on the backdrop,
   *   and it was being counted as one.
   *
   *   A form with nothing typed in it still closes immediately. Opening the
   *   wrong form and clicking away is not worth a question.
   *
   *   A form with something typed in it asks first, and the default answer
   *   is to stay. What was typed is still there behind the question either
   *   way -- answering "keep writing" leaves every field exactly as it was.
   *
   * What counts as "something typed" is the form's values against the ones
   * it opened with, so a form that pre-fills itself from an enquiry is not
   * treated as edited before it has been touched.
   */
  var opened = new WeakMap();

  function snapshot(overlay) {
    var fields = overlay.querySelectorAll('input, select, textarea');
    var out = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.type === 'file') { out.push(f.value); continue; }
      out.push(f.type === 'checkbox' || f.type === 'radio' ? String(f.checked) : f.value);
    }
    return out.join('\u0000');
  }

  function wasTypedIn(overlay) {
    var before = opened.get(overlay);
    return before !== undefined && snapshot(overlay) !== before;
  }

  window.nsModal = {
    /**
     * Wires one overlay: a click on the backdrop, and Escape, close it --
     * through a question first when there is something to lose.
     */
    guard: function (overlay, close) {
      if (!overlay) return;

      // Taken whenever the modal is shown, whatever showed it. The alternative
      // is a snapshot call at every place that opens one, which is nine places
      // and a tenth one someone adds later without knowing.
      new MutationObserver(function () {
        if (!overlay.hidden) opened.set(overlay, snapshot(overlay));
      }).observe(overlay, { attributes: true, attributeFilter: ['hidden'] });

      var leave = function () {
        if (!wasTypedIn(overlay)) { close(); return; }
        window.nsDialog.confirm('What you have filled in is lost.', {
          title: 'Leave this form?',
          confirmLabel: 'Discard it',
          cancelLabel: 'Keep writing',
          tone: 'danger',
        }).then(function (yes) { if (yes) close(); });
      };

      var fromBackdrop = false;
      overlay.addEventListener('pointerdown', function (e) { fromBackdrop = e.target === overlay; });
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay && fromBackdrop) leave();
      });
      document.addEventListener('keydown', function (e) {
        // Not while a question is up: Escape belongs to whatever is on top,
        // and the question is.
        if (e.key !== 'Escape' || overlay.hidden) return;
        if (showing) return;
        leave();
      });
    },
  };

  document.addEventListener('click', function (e) {
    var button = e.target.closest ? e.target.closest('[data-confirm]') : null;
    // A form carrying it is the submit handler's, not this one's -- that is
    // what the match resolves to when the question is on the form and the
    // press was on a button inside it.
    if (!button || button.tagName === 'FORM' || button.dataset.nsConfirmed) return;
    e.preventDefault();
    window.nsDialog.confirm(button.dataset.confirm, {
      tone: button.dataset.confirmTone || 'danger',
      confirmLabel: button.dataset.confirmLabel || 'Delete',
      title: button.dataset.confirmTitle || 'Are you sure?',
    }).then(function (yes) {
      if (!yes) return;
      button.dataset.nsConfirmed = '1';
      button.click();
      delete button.dataset.nsConfirmed;
    });
  }, true);
}());
