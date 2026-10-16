/**
 * What a field will accept, enforced while it is being typed into.
 *
 * The panel took anything anywhere: "322" went into Customer Name and
 * "gfgffg" into Phone Number, and both saved. Neither is a typo somebody
 * notices -- a name is not read back and a phone number is only found to be
 * wrong when the customer is late and nobody can ring them.
 *
 * Fixing it at the point of typing rather than at save: a field that quietly
 * refuses the keystroke teaches the rule in one go, where a message after
 * Save makes you go back and find the field. The server still has its own
 * checks; this is not a replacement for them, it is the half the person
 * typing actually sees.
 *
 * Driven by data-rule in the markup, so the rule lives next to the field it
 * belongs to rather than in a list over here that goes stale.
 *
 * Delegated from document rather than bound per field, because every modal in
 * the panel is written into the page after this runs, and a rule that only
 * covered what existed at load would be a rule that worked on the first form
 * and no other.
 */

(function () {
  'use strict';

  const RULES = {
    /* A person's name. Letters of any script -- Tamil names are written in
       Tamil -- plus the marks that go with them, and the three punctuation
       marks names actually contain. No digits: that is the whole point. */
    name: (v) => v.replace(/[^\p{L}\p{M} .'-]/gu, ''),

    /* A phone number is digits. The country code lives in its own select, so
       even "+" has no business here. */
    digits: (v) => v.replace(/[^0-9]/g, ''),

    /* A licence or an ID is written in capitals on the document it is copied
       from, and searching for one typed in lower case finds nothing. */
    upper: (v) => v.toUpperCase(),

    /* A registration plate: capitals, digits, and the spaces or dashes people
       put between the groups. */
    plate: (v) => v.toUpperCase().replace(/[^A-Z0-9 -]/g, ''),
  };

  /**
   * Rewrite the field, keeping the caret where the typist left it.
   *
   * Setting .value moves the caret to the end, which on an edit in the middle
   * of a name throws you to the end of the word on every keystroke. Every
   * rule here is per-character, so running it over the text to the left of
   * the caret counts how many of those characters survived -- and that count
   * is where the caret belongs.
   */
  function enforce(el, rule) {
    const before = el.value;
    const after = rule(before);
    if (after === before) return;

    const caret = el.selectionStart;
    el.value = after;
    if (caret !== null && caret !== undefined) {
      const kept = rule(before.slice(0, caret)).length;
      // Throws on input types that have no text selection. Those have no
      // rule on them, but a stray attribute should not break the field.
      try { el.setSelectionRange(kept, kept); } catch (e) { /* not selectable */ }
    }
  }

  // input, not keydown: this catches pasting, dragging text in, dictation and
  // the browser's own autofill as well as typing.
  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (!el || !el.dataset) return;
    const rule = RULES[el.dataset.rule];
    if (rule) enforce(el, rule);
  });

  /* A number input looks like it rejects letters and does not: Chrome accepts
     e and E as scientific notation and + and - as a sign, then reports the
     whole field empty rather than invalid. A quantity of kilometres or rupees
     is none of those things, and every one of these fields has min="0". */
  document.addEventListener('keydown', (ev) => {
    const el = ev.target;
    if (!el || el.type !== 'number') return;
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (['e', 'E', '+', '-'].includes(ev.key)) ev.preventDefault();
  });

  /* And the same characters arriving by paste, which keydown never sees. */
  document.addEventListener('paste', (ev) => {
    const el = ev.target;
    if (!el || el.type !== 'number') return;
    const text = (ev.clipboardData || window.clipboardData)?.getData('text') ?? '';
    if (/[eE+\-]/.test(text)) {
      ev.preventDefault();
      const cleaned = text.replace(/[^0-9.]/g, '');
      if (cleaned !== '') {
        el.value = cleaned;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
})();
