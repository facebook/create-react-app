/**
 * Removing an item from a repeated list on the content page.
 *
 * A section is posted whole, and an item with every box empty is dropped when
 * it is saved. So the bin empties the boxes: it does exactly what the hint used
 * to ask people to do by hand, and the semantics are unchanged.
 *
 * Which also means it is not gone until Save is pressed. The row says so rather
 * than letting someone close the page believing it was.
 */
(function () {
  'use strict';

  document.addEventListener('click', function (ev) {
    var button = ev.target.closest('.c-row-del');
    if (!button) return;

    var row = button.closest('.c-row');
    if (!row) return;

    var fields = row.querySelectorAll('input, textarea');
    var hadContent = [].some.call(fields, function (f) { return f.value.trim() !== ''; });
    if (!hadContent) { clearRow(row, fields); return; }

    nsDialog.confirm('It goes from the page when you save the section.', {
      title: 'Remove this item?',
      confirmLabel: 'Remove',
      tone: 'danger',
    }).then(function (yes) { if (yes) clearRow(row, fields); });
  });

  /** Empties the row and says so, which is the same whether we asked or not. */
  function clearRow(row, fields) {
    [].forEach.call(fields, function (f) { f.value = ''; });
    row.classList.add('is-cleared');

    var note = row.querySelector('.c-row-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'c-hint c-row-note';
      row.appendChild(note);
    }
    note.textContent = 'Emptied — it is removed when you save this section.';

    // Focus the save button, so the step that actually removes it is the next
    // thing under the hand rather than something to go looking for.
    var save = row.closest('form')?.querySelector('[value="save"]');
    if (save) save.focus();
  }
}());

/**
 * Framing a site image before it is uploaded.
 *
 * Every slot has a shape the site actually lays it out in -- a logo is square,
 * a page banner is 16:5, a card is 16:10 -- and the frame here is that shape
 * exactly. What you put inside it is what appears on the site, rather than the
 * browser cropping a photograph of some other proportion and nobody knowing
 * which part survived until the page is loaded.
 *
 * The same code the vehicle photographs use, but that lives in admin.js, which
 * this page does not load: dashboard.php is one long script for one screen,
 * and pulling it in for a cropper would bring the whole booking panel with it.
 *
 * Written by hand rather than with a cropping library because the panel has no
 * build step -- every script here is a plain file the browser loads.
 */
(function () {
  'use strict';

  var overlay = document.getElementById('frameOverlay');
  if (!overlay) return;

  var win    = document.getElementById('frameWindow');
  var img    = document.getElementById('frameImg');
  var zoom   = document.getElementById('frameZoom');
  var title  = document.getElementById('frameTitle');
  var hint   = document.getElementById('frameHint');

  // Position and scale of the image inside the window, in window pixels.
  var st = { x: 0, y: 0, scale: 1, base: 1, natW: 0, natH: 0 };
  var form = null;        // the slot being framed
  var outW = 1200, outH = 750;

  function apply() {
    img.style.transform = 'translate(' + st.x + 'px, ' + st.y + 'px) scale(' + (st.base * st.scale) + ')';
  }

  /** Keeps the image covering the window, so no empty corner can be framed. */
  function clamp() {
    var w = win.clientWidth, h = win.clientHeight;
    st.x = Math.min(0, Math.max(w - st.natW * st.base * st.scale, st.x));
    st.y = Math.min(0, Math.max(h - st.natH * st.base * st.scale, st.y));
  }

  function open(src, slotForm, label, fallback) {
    form = slotForm;
    var ratio = (slotForm.dataset.ratio || '16:10').split(':').map(Number);
    var out   = (slotForm.dataset.out || '1200x750').split('x').map(Number);
    outW = out[0]; outH = out[1];

    // The window is the slot's own shape, so what is framed is what is saved.
    win.style.aspectRatio = ratio[0] + ' / ' + ratio[1];

    title.textContent = 'Frame ' + label.toLowerCase();
    hint.textContent = 'Saved at ' + outW + '×' + outH + ', in a ' + ratio[0] + ':' + ratio[1] + ' frame.';

    var probe = new Image();
    // The stored image is served from this same origin, so re-framing one does
    // not taint the canvas. A cross-origin source would, and toBlob would throw.
    probe.crossOrigin = 'anonymous';
    probe.onload = function () {
      overlay.hidden = false;           // sized only once it is on screen
      st.natW = probe.naturalWidth;
      st.natH = probe.naturalHeight;

      var w = win.clientWidth || 360;
      var h = win.clientHeight || 225;
      // Start at the smallest scale that still fills the frame, so the opening
      // view is always valid and usually the whole picture.
      st.base = Math.max(w / st.natW, h / st.natH);
      st.scale = 1;
      zoom.value = '100';

      img.src = probe.src;
      img.style.width = st.natW + 'px';
      img.style.height = st.natH + 'px';
      st.x = (w - st.natW * st.base) / 2;
      st.y = (h - st.natH * st.base) / 2;
      clamp();
      apply();
    };
    probe.onerror = function () {
      // One retry at the older address, for a server that is not applying the
      // rewrite that turns /admin/images/<name> into brand.php?f=<name>. The
      // thumbnail beside this button does the same, so the two agree about
      // which address works.
      if (fallback) {
        var retry = fallback;
        fallback = null;
        probe.src = retry;
        return;
      }
      nsDialog.tell('That image could not be opened.', { title: 'Picture' });
    };
    probe.src = src;
  }

  function close() {
    overlay.hidden = true;
    form = null;
  }

  // ---- panning, with a finger as readily as a mouse ----
  var drag = null;
  win.addEventListener('pointerdown', function (e) {
    if (overlay.hidden) return;
    drag = { px: e.clientX, py: e.clientY, x: st.x, y: st.y };
    win.setPointerCapture(e.pointerId);
  });
  win.addEventListener('pointermove', function (e) {
    if (!drag) return;
    st.x = drag.x + (e.clientX - drag.px);
    st.y = drag.y + (e.clientY - drag.py);
    clamp();
    apply();
  });
  ['pointerup', 'pointercancel'].forEach(function (done) {
    win.addEventListener(done, function () { drag = null; });
  });

  function setZoom(next) {
    var w = win.clientWidth, h = win.clientHeight;
    // About the middle of the frame, which is where the eye is. About the
    // corner would send the subject off the edge.
    var cx = (w / 2 - st.x) / st.scale;
    var cy = (h / 2 - st.y) / st.scale;
    st.scale = Math.min(3, Math.max(1, next));
    zoom.value = String(Math.round(st.scale * 100));
    st.x = w / 2 - cx * st.scale;
    st.y = h / 2 - cy * st.scale;
    clamp();
    apply();
  }

  /**
   * A slot that keeps the whole image: scaled down to fit the box and sent,
   * with no frame in between.
   *
   * A logo is artwork that already has its margins decided. Framing one to a
   * shape cuts the words off it -- which is what a square frame did to the
   * lockup, leaving "NiteSha CARS" with the rest of the name outside the
   * crop. Scaling keeps every pixel and only bounds the file.
   */
  function sendWhole(file, slotForm) {
    var out = (slotForm.dataset.out || '1280x800').split('x').map(Number);
    var url = URL.createObjectURL(file);
    var probe = new Image();

    probe.onload = function () {
      URL.revokeObjectURL(url);
      // Never upscale: a small logo blown up to the box is a blurry logo.
      var fit = Math.min(1, out[0] / probe.naturalWidth, out[1] / probe.naturalHeight);
      var w = Math.max(1, Math.round(probe.naturalWidth * fit));
      var h = Math.max(1, Math.round(probe.naturalHeight * fit));

      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      // No fill behind it: a logo is drawn on the navy header, and a white
      // rectangle where the transparency was is worse than no logo at all.
      ctx.drawImage(probe, 0, 0, w, h);

      canvas.toBlob(function (blob) {
        // If the canvas cannot produce one, the file the person chose is
        // still a perfectly good upload; the server checks it either way.
        submitSlot(slotForm, blob ? new File([blob], 'image.webp', { type: 'image/webp' }) : file);
      }, 'image/webp', 0.9);
    };

    probe.onerror = function () {
      URL.revokeObjectURL(url);
      submitSlot(slotForm, file);
    };
    probe.src = url;
  }

  /** Puts one file into a slot's form and posts it. */
  function submitSlot(slotForm, file) {
    // DataTransfer is the only way to put a file into an <input type=file>,
    // which is what keeps this an ordinary form post rather than a fetch with
    // its own error handling.
    var dt = new DataTransfer();
    dt.items.add(file);
    slotForm.querySelector('.brand-slot-file').files = dt.files;
    slotForm.querySelector('[name="action"]').value = 'brand-upload';
    slotForm.submit();
  }

  zoom.addEventListener('input', function () { setZoom(Number(zoom.value) / 100); });
  document.getElementById('frameIn').addEventListener('click', function () { setZoom(st.scale + 0.2); });
  document.getElementById('frameOut').addEventListener('click', function () { setZoom(st.scale - 0.2); });
  document.getElementById('frameCancel').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  document.getElementById('frameSave').addEventListener('click', function () {
    if (!form) return;
    var w = win.clientWidth, h = win.clientHeight;
    var drawn = st.base * st.scale;

    var canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    // What the frame shows, in the source image's own pixels.
    ctx.drawImage(img, -st.x / drawn, -st.y / drawn, w / drawn, h / drawn, 0, 0, outW, outH);

    var target = form;
    canvas.toBlob(function (blob) {
      if (!blob) { nsDialog.tell('The framed image could not be prepared.', { title: 'Picture' }); return; }
      close();
      submitSlot(target, new File([blob], 'image.webp', { type: 'image/webp' }));
    }, 'image/webp', 0.85);
  });

  // ---- the buttons on each slot ----
  document.addEventListener('click', function (ev) {
    var slot = ev.target.closest('.brand-slot');
    if (!slot) return;
    var label = slot.querySelector('.brand-slot-label').textContent.trim();

    if (ev.target.closest('.brand-pick')) {
      slot.querySelector('.brand-slot-file').click();
      return;
    }
    if (ev.target.closest('.brand-edit')) {
      var edit = ev.target.closest('.brand-edit');
      open(edit.dataset.src, slot, label, edit.dataset.srcFallback || null);
      return;
    }
    if (ev.target.closest('.brand-remove')) {
      nsDialog.confirm('The site goes back to the picture it ships with.', {
        title: 'Remove the image for \u201c' + label + '\u201d?',
        confirmLabel: 'Remove',
        tone: 'danger',
      }).then(function (yes) {
        if (!yes) return;
        slot.querySelector('[name="action"]').value = 'brand-clear';
        // Cleared, or an empty file part would arrive with the clear.
        slot.querySelector('.brand-slot-file').value = '';
        slot.submit();
      });
    }
  });

  // Choosing a file opens the frame rather than uploading straight away.
  document.addEventListener('change', function (ev) {
    if (!ev.target.classList.contains('brand-slot-file')) return;
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    var slot = ev.target.closest('.brand-slot');
    // The logo goes straight up, whole. Everything else is framed first.
    if (slot.dataset.fit === 'whole') { sendWhole(file, slot); return; }
    open(URL.createObjectURL(file), slot, slot.querySelector('.brand-slot-label').textContent.trim());
  });
}());
