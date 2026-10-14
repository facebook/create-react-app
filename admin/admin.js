// The server decides who is signed in; by the time this page renders, the
// session has already been checked. Signing out is a form post to logout.php.

/**
 * May this account do that? Published by the shell; see shell.js.
 *
 * Guarded so this file still works if shell.js has not run -- in which case
 * nothing is hidden, and the server refuses what it must, as it always did.
 */
function can(ability) {
  return typeof window.nsCan !== 'function' || window.nsCan(ability);
}

/**
 * Takes the card or column an element sits in off the page unless the account
 * may see what is in it. The whole card, not the figure: a "Total Income"
 * label above an empty space is worse than no card at all.
 */
function hideUnless(ability, ...ids) {
  if (can(ability)) return;
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) (el.closest('.stat-card, .dashboard-col') || el).hidden = true;
  });
}

/**
 * Every panel was drawn on load, whatever the account was allowed to see.
 * On a Counter Staff account that meant four requests the server refused,
 * four errors in the console, four rows in the audit log, and a Finance
 * screen reading "Could not load finance: You do not have permission to do
 * that" -- for a tab that should not have been offered in the first place.
 */
function showDashboard() {
  renderOverview();
  if (can('vehicle.view')) renderCarAdminGrid();
  if (can('enquiry.view')) renderInquiries();
  if (can('expense.view')) renderFinance();
  if (can('booking.view')) renderBookingList();
  if (can('report.view')) renderReport();
}

/**
 * Shows an error where the user is looking, rather than in the console.
 * Validation failures carry per-field messages, which are worth surfacing
 * in full so the user can fix everything in one pass.
 */
function showError(err) {
  const fields = err && err.fields ? Object.values(err.fields) : [];
  const detail = fields.length ? '\n\n' + fields.join('\n') : '';
  nsDialog.tell((err && err.message ? err.message : 'Something went wrong.') + detail,
                { title: 'That did not go through' });
}

// Vehicles come from the database now. Everything below reads them through
// loadCars(), so they are fetched once here and cached for the page.
async function boot() {
  try {
    if (can('vehicle.view')) await refreshVehicles();
  } catch (err) {
    showError(err);
    return;
  }
  showDashboard();
  void renderAlerts();
  openFromLink();
}

/**
 * A reminder clicked from another admin page arrives as a link.
 *
 * The bell is in the bar everywhere, but only this page can open a booking.
 * From Website content or Places it navigates here carrying what it was about,
 * so the click lands on the thing itself and not merely on the tab it lives
 * under -- which would leave somebody scrolling for the booking they had just
 * pointed at.
 */
/** Brings a panel up if it is not the one on screen. */
function showPanelFor(tab) {
  const panel = document.getElementById(`panel-${tab}`);
  if (panel && panel.hidden) document.querySelector(`.admin-tab[data-tab="${tab}"]`)?.click();
}

function openFromLink() {
  const params = new URLSearchParams(window.location.search);
  const booking = Number(params.get('booking'));
  const enquiry = Number(params.get('enquiry'));
  const vehicle = Number(params.get('vehicle'));

  if (booking) openBookingDetail(booking);
  else if (enquiry) openEnquiry(enquiry);
  else if (vehicle) openCarById(vehicle);
  else return;

  // Taken back out of the address bar, so a reload or a bookmark does not keep
  // reopening the same modal long after it was dealt with.
  window.history.replaceState({}, '', window.location.pathname + window.location.hash);
}

document.addEventListener('DOMContentLoaded', boot);

/**
 * The bin, for every delete in the panel.
 *
 * One drawing rather than the word "Delete" in some places, an "x" in others
 * and "Void" in a third: a row of buttons is scanned by shape long before it is
 * read. Every use pairs it with a title and an aria-label, because an icon on
 * its own is a button a screen reader announces as nothing at all.
 */
const BIN_ICON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
  ' stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/>' +
  '<path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>' +
  '<path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

// ---- Tabs ----
const TAB_PANELS = ['dashboard', 'bookings', 'cars', 'inquiries', 'finance', 'reports'];
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('is-on'));
    tab.classList.add('is-on');
    const target = tab.dataset.tab;
    TAB_PANELS.forEach((name) => {
      document.getElementById(`panel-${name}`).hidden = target !== name;
    });

    // Put the panel in the address bar, so refreshing stays where you were
    // and a tab can be linked to or left open in a second window.
    //
    // replaceState rather than assigning location.hash: assigning it fires
    // hashchange, which shell.js listens to and would route straight back
    // here -- and it would put an entry in the history for every tab anyone
    // glanced at, so Back would walk through all of them before leaving.
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', '#' + target);
    }

    // The bar used to say "Dashboard" whatever was on screen, so the heading
    // and the highlighted sidebar item disagreed about where you were. Taken
    // from the sidebar rather than a second list of names, which would be a
    // second place to keep them in step.
    const title = document.getElementById('nsTitle');
    const label = tab.querySelector('.ns-item-label');
    if (title && label) {
      title.textContent = label.textContent.trim();
      document.title = `${label.textContent.trim()} · NiteSha Admin`;
    }
    if (target === 'dashboard') renderOverview();
    if (target === 'finance') renderFinance();
    if (target === 'bookings') renderBookingList();
    if (target === 'reports') renderReport();
  });
});

// ---- Car admin grid ----
function renderCarAdminGrid() {
  const wrap = document.getElementById('carAdminGrid');
  const cars = loadCars();

  if (!cars.length) {
    wrap.innerHTML = '<div class="empty-state">No cars yet. Click "+ Add Car" to list your first one.</div>';
    return;
  }

  wrap.innerHTML = cars.map((car) => `
    <div class="car-admin-card" data-id="${car.id}">
      <div class="admin-car-thumb">${car.photo
        ? `<img src="${car.photo}" alt="" loading="lazy">`
        : carIllustrationSVG(car.bodyType, car.color)}</div>
      <div class="row1">
        <span class="name">${car.name}</span>
        <span class="status-badge status-badge-${car.status.replace(' ', '')}">${car.status}</span>
      </div>
      ${car.ownership === 'partner' ? `
        <div class="meta">
          <span class="owner-badge">${car.isTemporary ? 'Temporary' : "Someone else's"}</span>
          ${car.isTemporary
            ? '<span class="owner-badge owner-badge-quiet">Not on the website</span>'
            : ''}
          <span>${car.ownerName ? escapeHTML(car.ownerName) : 'Owner not named'}</span>
          ${car.ownerPhone ? `<span>${escapeHTML(car.ownerPhone)}</span>` : ''}
        </div>` : ''}
      <div class="meta">
        <span>${car.brand}</span>
        <span>${car.bodyType}</span>
        <span>${car.regNumber || 'No reg. no.'}</span>
        <span>${car.fuel}</span>
        <span>${car.transmission}</span>
        <span>${car.seats} Seats</span>
        <span>${car.year}</span>
      </div>
      <div class="meta">
        <span>KM limit: ${car.kmLimitPerDay}/day</span>
        <span>Extra KM: ₹${car.extraKmRate}</span>
        <span>Deposit: ₹${car.securityDeposit.toLocaleString('en-IN')}</span>
        <span>Odometer: ${car.currentKm.toLocaleString('en-IN')} km</span>
      </div>
      <div class="price">₹${car.price.toLocaleString('en-IN')}/day</div>
      <div class="actions">
        <button class="btn btn-outline btn-sm edit-car-btn">Edit</button>
        <button class="btn btn-ghost btn-sm service-car-btn">Service</button>
        <button class="btn btn-danger btn-sm btn-icon delete-car-btn" title="Retire this vehicle" aria-label="Retire this vehicle">${BIN_ICON}</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.service-car-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('.car-admin-card').dataset.id);
      openServiceModal(loadCars().find((c) => c.id === id));
    });
  });
  wrap.querySelectorAll('.edit-car-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('.car-admin-card').dataset.id);
      openCarModal(loadCars().find((c) => c.id === id));
    });
  });
  wrap.querySelectorAll('.delete-car-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = Number(e.target.closest('.car-admin-card').dataset.id);
      const car = loadCars().find((c) => c.id === id);
      // Retired rather than deleted: bookings, expenses and KM records point
      // at this vehicle, and removing it would orphan that history.
      // One dialog rather than two: a confirm followed by a prompt made
      // somebody answer the same decision twice.
      const reason = await nsDialog.ask('Reason (optional)', {
        title: `Retire \u201c${car.name}\u201d?`,
        body: 'It stops appearing in the fleet. Its bookings, expenses and '
            + 'readings are kept and still point at it.',
        confirmLabel: 'Retire',
        tone: 'danger',
        placeholder: 'Sold, off the road, …',
      });
      if (reason === null) return;
      btn.disabled = true;
      try {
        await retireVehicle(id, reason);
        renderCarAdminGrid();
        renderOverview();
      } catch (err) {
        showError(err);
      } finally {
        btn.disabled = false;
      }
    });
  });
}

// ---- Car modal (add/edit) ----
const carModalOverlay = document.getElementById('carModalOverlay');
const carForm = document.getElementById('carForm');
const carModalTitle = document.getElementById('carModalTitle');

/** Opens a vehicle by id. What the reminders bell has; openCarModal wants the
 *  whole record, which only this file can look up. */
function openCarById(id) {
  const car = loadCars().find((c) => c.id === Number(id));
  if (car) openCarModal(car);
}

function openCarModal(car) {
  carForm.reset();
  document.getElementById('carId').value = car ? car.id : '';
  carModalTitle.textContent = car ? 'Edit Vehicle' : 'Add Vehicle';
  document.getElementById('carBrand').value = car ? car.brand : '';
  document.getElementById('carBodyType').value = car ? car.bodyType : 'Hatchback';
  document.getElementById('carName').value = car ? car.name : '';
  document.getElementById('carRegNumber').value = car ? car.regNumber : '';
  document.getElementById('carColor').value = car ? car.color : '#5B6472';
  document.getElementById('carFuel').value = car ? car.fuel : 'Petrol';
  document.getElementById('carTransmission').value = car ? car.transmission : 'Manual';
  document.getElementById('carSeats').value = car ? car.seats : 5;
  document.getElementById('carYear').value = car ? car.year : new Date().getFullYear();
  document.getElementById('carStatus').value = car ? car.status : 'Available';
  document.getElementById('carOwnership').value = car ? (car.ownership || 'own') : 'own';
  document.getElementById('carOwnerName').value = car ? (car.ownerName || '') : '';
  document.getElementById('carOwnerPhone').value = car ? (car.ownerPhone || '') : '';
  document.getElementById('carTemporary').checked = Boolean(car && car.isTemporary);
  for (const [id, key] of UPKEEP_FIELDS) {
    document.getElementById(id).value = car ? (car[key] ?? '') : '';
  }
  syncOwnerFields();
  document.getElementById('carPrice').value = car ? car.price : '';
  document.getElementById('carPriceMax').value = car ? car.priceMax : '';
  document.getElementById('carPrice7').value = car ? car.price7 : '';
  document.getElementById('carPrice15').value = car ? car.price15 : '';
  document.getElementById('carPrice30').value = car ? car.price30 : '';
  document.getElementById('carKmLimit').value = car ? car.kmLimitPerDay : 200;
  document.getElementById('carExtraKmRate').value = car ? car.extraKmRate : '';
  document.getElementById('carSecurityDeposit').value = car ? car.securityDeposit : '';
  document.getElementById('carCurrentKm').value = car ? car.currentKm : 0;

  // Reset by hand: form.reset() clears the file input but not the preview, and
  // a preview left from the last vehicle edited would be a picture of the
  // wrong car sitting above the right one's details.
  photoRemoved = false;
  document.getElementById('carPhoto').value = '';
  document.getElementById('carCropBox').hidden = true;
  showCarPhoto(car && car.photo ? car.photo : null);

  carModalOverlay.hidden = false;
}

// Set when Remove is pressed, so Save knows to clear the photograph even
// though nothing was chosen to replace it.
let photoRemoved = false;

function showCarPhoto(url) {
  const preview = document.getElementById('carPhotoPreview');
  const img = document.getElementById('carPhotoPreviewImg');
  if (url) {
    img.src = url;
    preview.hidden = false;
  } else {
    img.removeAttribute('src');
    preview.hidden = true;
  }
}

document.getElementById('carPhotoRemove').addEventListener('click', () => {
  // Nothing is deleted until Save. Pressing Remove and then Cancel should
  // leave the vehicle exactly as it was.
  photoRemoved = true;
  document.getElementById('carPhoto').value = '';
  document.getElementById('carCropBox').hidden = true;
  showCarPhoto(null);
});

// ---- Framing a photograph ----
//
// Every car is saved at one size, 1200x750, which is the shape the website's
// cards use. That is what stops the fleet looking ragged: the page is not
// cropping pictures of different proportions and hoping, it is laying out
// identical rectangles. It also means a 4 MB phone photograph arrives as
// something around 150 KB, which the fleet page fetches once per car.
//
// Written by hand rather than with a cropping library because the panel has no
// build step -- every script here is a plain file the browser loads, and
// adding a dependency would mean adding one.
const CROP_W = 1200;
const CROP_H = 750;

const cropBox = document.getElementById('carCropBox');
const cropWindow = document.getElementById('carCropWindow');
const cropImg = document.getElementById('carCropImg');
const cropZoom = document.getElementById('carCropZoom');

// Position and scale of the image inside the window, in window pixels.
let crop = { x: 0, y: 0, scale: 1, base: 1, natW: 0, natH: 0 };

function cropApply() {
  cropImg.style.transform =
    `translate(${crop.x}px, ${crop.y}px) scale(${crop.base * crop.scale})`;
}

/** Keeps the image covering the window, so no empty corner can be framed. */
function cropClamp() {
  const w = cropWindow.clientWidth;
  const h = cropWindow.clientHeight;
  const drawnW = crop.natW * crop.base * crop.scale;
  const drawnH = crop.natH * crop.base * crop.scale;
  crop.x = Math.min(0, Math.max(w - drawnW, crop.x));
  crop.y = Math.min(0, Math.max(h - drawnH, crop.y));
}

function cropStart(file) {
  const url = URL.createObjectURL(file);
  const probe = new Image();
  probe.onload = () => {
    crop.natW = probe.naturalWidth;
    crop.natH = probe.naturalHeight;
    // Start at the smallest scale that still fills the window, so the opening
    // view is always valid and usually the whole car.
    const w = cropWindow.clientWidth || 360;
    const h = cropWindow.clientHeight || 225;
    crop.base = Math.max(w / crop.natW, h / crop.natH);
    crop.scale = 1;
    cropZoom.value = '100';
    cropImg.src = url;
    cropImg.style.width = `${crop.natW}px`;
    cropImg.style.height = `${crop.natH}px`;
    // Centre it.
    crop.x = (w - crop.natW * crop.base) / 2;
    crop.y = (h - crop.natH * crop.base) / 2;
    cropClamp();
    cropApply();
    cropBox.hidden = false;
  };
  probe.onerror = () => {
    showError(new Error('That image could not be opened.'));
  };
  probe.src = url;
}

// Pointer events rather than mouse events, so dragging works with a finger on
// a phone as well as a mouse -- the panel is used on both.
let dragging = null;
cropWindow.addEventListener('pointerdown', (e) => {
  if (cropBox.hidden) return;
  dragging = { px: e.clientX, py: e.clientY, x: crop.x, y: crop.y };
  cropWindow.setPointerCapture(e.pointerId);
});
cropWindow.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  crop.x = dragging.x + (e.clientX - dragging.px);
  crop.y = dragging.y + (e.clientY - dragging.py);
  cropClamp();
  cropApply();
});
for (const done of ['pointerup', 'pointercancel']) {
  cropWindow.addEventListener(done, () => { dragging = null; });
}

cropZoom.addEventListener('input', () => {
  const w = cropWindow.clientWidth;
  const h = cropWindow.clientHeight;
  // Zoom about the middle of the window, which is where the eye is, rather
  // than the top-left corner, which sends the subject off the edge.
  const cx = (w / 2 - crop.x) / crop.scale;
  const cy = (h / 2 - crop.y) / crop.scale;
  crop.scale = Number(cropZoom.value) / 100;
  crop.x = w / 2 - cx * crop.scale;
  crop.y = h / 2 - cy * crop.scale;
  cropClamp();
  cropApply();
});

/** The framed area, as a file ready to upload. */
function croppedBlob() {
  return new Promise((resolve, reject) => {
    const w = cropWindow.clientWidth;
    const h = cropWindow.clientHeight;
    const drawn = crop.base * crop.scale;

    // What the window shows, in the source image's own pixels.
    const sx = -crop.x / drawn;
    const sy = -crop.y / drawn;
    const sw = w / drawn;
    const sh = h / drawn;

    const canvas = document.createElement('canvas');
    canvas.width = CROP_W;
    canvas.height = CROP_H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cropImg, sx, sy, sw, sh, 0, 0, CROP_W, CROP_H);

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(new File([blob], 'photo.webp', { type: 'image/webp' }));
        else reject(new Error('The framed image could not be prepared.'));
      },
      'image/webp',
      0.85,
    );
  });
}

// Show the chosen file straight away rather than after saving, so a wrong
// picture is obvious before it is committed to anything.
document.getElementById('carPhoto').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  photoRemoved = false;
  document.getElementById('carPhotoPreview').hidden = true;
  cropStart(file);
});

function closeCarModal() {
  carModalOverlay.hidden = true;
}

/**
 * The owner fields belong to a partner car and nothing else.
 *
 * Left on screen for our own cars they are three boxes that do nothing, and a
 * box that does nothing is one somebody eventually fills in.
 */
// The papers, the service markers and the tracker. One list, because these are
// nine plain fields that all travel the same way and nine hand-written lines
// each way is eighteen chances to forget one.
const UPKEEP_FIELDS = [
  ['carPurchaseDate', 'purchase_date'],
  ['carInsuranceExpiry', 'insurance_expiry'],
  ['carPollutionExpiry', 'pollution_expiry'],
  ['carFitnessExpiry', 'fitness_expiry'],
  ['carServiceDueKm', 'service_due_km'],
  ['carServiceDueOn', 'service_due_on'],
  ['carGpsProvider', 'gps_provider'],
  ['carGpsDeviceId', 'gps_device_id'],
  ['carGpsUrl', 'gps_url'],
];

function syncOwnerFields() {
  const partner = document.getElementById('carOwnership').value === 'partner';
  for (const el of document.querySelectorAll('[data-partner-only]')) el.hidden = !partner;
  if (!partner) {
    document.getElementById('carOwnerName').value = '';
    document.getElementById('carOwnerPhone').value = '';
    document.getElementById('carTemporary').checked = false;
  }
}
document.getElementById('carOwnership').addEventListener('change', syncOwnerFields);

// Hidden rather than offered and refused, the same as the quick actions.
hideUnless('vehicle.edit', 'addCarBtn');
document.getElementById('addCarBtn').addEventListener('click', () => openCarModal(null));
document.getElementById('carModalCancel').addEventListener('click', closeCarModal);
// Closing by clicking away asks first when the form has been filled in.
// See nsModal.guard in dialog.js.
nsModal.guard(carModalOverlay, closeCarModal);

carForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const idValue = document.getElementById('carId').value;

  const carData = {
    brand: document.getElementById('carBrand').value.trim(),
    bodyType: document.getElementById('carBodyType').value,
    name: document.getElementById('carName').value.trim(),
    regNumber: document.getElementById('carRegNumber').value.trim().toUpperCase(),
    color: document.getElementById('carColor').value,
    fuel: document.getElementById('carFuel').value,
    transmission: document.getElementById('carTransmission').value,
    seats: Number(document.getElementById('carSeats').value),
    year: Number(document.getElementById('carYear').value),
    status: document.getElementById('carStatus').value,
    ownership: document.getElementById('carOwnership').value,
    ownerName: document.getElementById('carOwnerName').value.trim(),
    ownerPhone: document.getElementById('carOwnerPhone').value.trim(),
    isTemporary: document.getElementById('carTemporary').checked,
    ...Object.fromEntries(UPKEEP_FIELDS.map(([id, key]) => [key, document.getElementById(id).value])),
    price: Number(document.getElementById('carPrice').value),
    priceMax: document.getElementById('carPriceMax').value.trim() === ''
      ? ''
      : Number(document.getElementById('carPriceMax').value),
    price7: Number(document.getElementById('carPrice7').value) || 0,
    price15: Number(document.getElementById('carPrice15').value) || 0,
    price30: Number(document.getElementById('carPrice30').value) || 0,
    kmLimitPerDay: Number(document.getElementById('carKmLimit').value),
    extraKmRate: Number(document.getElementById('carExtraKmRate').value),
    securityDeposit: Number(document.getElementById('carSecurityDeposit').value),
    currentKm: Number(document.getElementById('carCurrentKm').value),
  };

  if (idValue) {
    carData.id = Number(idValue);
  }

  const submitBtn = carForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    // The server validates and stores; the panel re-reads rather than
    // guessing what was saved, so what is shown is what is recorded.
    const saved = await saveVehicle(carData);

    // Second, and only now: a photograph is stored against a vehicle id, and a
    // vehicle being created has none until the save above returns one.
    const chosen = document.getElementById('carPhoto').files[0] || null;
    const vehicleId = saved && saved.id ? saved.id : carData.id;
    if (vehicleId && (chosen || photoRemoved)) {
      // The framed version, at a fixed size, rather than whatever came off the
      // phone. Uploading the original would put the cropping back on the
      // website, where it has no idea which part of the picture matters.
      const image = chosen ? await croppedBlob() : null;
      await saveVehiclePhoto(vehicleId, image);
    }

    closeCarModal();
    renderCarAdminGrid();
    renderOverview();
  } catch (err) {
    showError(err);
  } finally {
    submitBtn.disabled = false;
  }
});

// ---- Inquiries ----
let enquiryStatusFilter = '';
let enquirySearch = '';

const enquiryView = { sort: 'created_at', dir: 'desc', page: 1, perPage: 30 };

const ENQUIRY_CHIPS = [
  ['', 'All'], ['New', 'New'], ['Contacted', 'Contacted'], ['Pending', 'Pending'],
  ['Accepted', 'Accepted'], ['Converted', 'Converted'], ['Rejected', 'Rejected'],
  ['Cancelled', 'Cancelled'],
];

// Typing filters as you go, but only once you stop — a request per keystroke
// would be a lot of queries for no benefit.
let enquirySearchTimer = null;
document.getElementById('enquirySearch')?.addEventListener('input', (e) => {
  clearTimeout(enquirySearchTimer);
  enquirySearchTimer = setTimeout(async () => {
    enquirySearch = e.target.value.trim();
    enquiryView.page = 1;
    await renderInquiries();
  }, 300);
});

document.getElementById('enquiryReset')?.addEventListener('click', async () => {
  enquirySearch = '';
  enquiryStatusFilter = '';
  enquiryView.page = 1;
  const box = document.getElementById('enquirySearch');
  if (box) box.value = '';
  await renderInquiries();
});

/**
 * The number beside Inquiries in the sidebar: how many nobody has opened.
 *
 * Unread, not unresolved. An enquiry stays Contacted for days while somebody
 * waits on a callback, and a badge that sits on 1 the whole time is a badge
 * nobody reads -- the morning it says 3 looks like every other morning. The
 * server counts it, because the list on screen is filtered and the badge is
 * about the whole table.
 */
function setInquiryBadge(unread) {
  const badge = document.getElementById('inquiryCount');
  if (!badge) return;
  // Emptied rather than zeroed: the stylesheet hides an empty badge, and a
  // grey "0" beside Inquiries is a thing to read every morning that never
  // means anything.
  badge.textContent = Number(unread) || '';
}

async function renderInquiries() {
  const wrap = document.getElementById('inquiriesWrap');
  if (!wrap) return;

  // Fetched unfiltered and filtered here, so the chips can carry counts: a
  // count taken from a list the server has already narrowed is a count of
  // what is on screen, which is the one number nobody needs.
  let answer;
  try {
    answer = await api.enquiries.list('', enquirySearch);
  } catch (err) {
    wrap.innerHTML = '<div class="empty-state">Could not load enquiries.</div>';
    showError(err);
    return;
  }
  const all = answer.enquiries;
  setInquiryBadge(answer.unread);
  // Only mark rows when the database knows what has been read. Otherwise
  // every viewed_at is null and the whole list would claim to be unread.
  const tracksRead = answer.tracks_read !== false;

  const by = (status) => all.filter((e) => e.status === status).length;
  renderRecStats('enquiryStats', [
    { n: all.length, k: 'Total', icon: 'inbox' },
    { n: by('New'), k: 'New', icon: 'star' },
    { n: by('Contacted') + by('Pending'), k: 'In progress', icon: 'phone' },
    { n: by('Converted'), k: 'Booked', icon: 'tick', tone: 'good' },
    { n: by('Rejected') + by('Cancelled'), k: 'Closed', icon: 'cross' },
  ]);

  renderRecChips('enquiryChips', ENQUIRY_CHIPS.map(([value, label]) => ({
    value, label, n: value === '' ? all.length : by(value),
  })), enquiryStatusFilter, (value) => {
    enquiryStatusFilter = value;
    enquiryView.page = 1;
    renderInquiries();
  });

  const rows = all.filter((e) => !enquiryStatusFilter || e.status === enquiryStatusFilter);

  renderRecTable({
    wrap,
    pagerId: 'enquiryPager',
    view: enquiryView,
    rows,
    noun: ['inquiry', 'inquiries'],
    empty: enquirySearch || enquiryStatusFilter
      ? 'No enquiries match that.'
      : 'No enquiries yet. Submissions from the booking form on niteshacars.in appear here.',
    rowClass: (e) => (tracksRead && !e.viewed_at ? 'rec-unread' : ''),
    columns: [
      { key: 'enquiry_number', label: 'Inquiry No.', hide: true, sort: (e) => e.enquiry_number,
        cell: (e) => `<span class="rec-id">${escapeHTML(e.enquiry_number)}</span>` },
      // One heading per thing. The name used to carry the phone number under
      // it and "Asked for" carried the hire dates, which left two of the
      // enquiry's six facts with no heading at all and put the hire dates
      // close enough to Received to be read as the same date. Separate
      // columns, and the box scrolls.
      { key: 'name', label: 'Name', sort: (e) => e.name.toLowerCase(),
        cell: (e) => `<span class="rec-who rec-clip" title="${escapeHTML(e.name)}"
                        >${escapeHTML(e.name)}</span>
                      <div class="rec-sub rec-id rec-only-sm">${escapeHTML(e.enquiry_number)}</div>` },
      { key: 'phone', label: 'Contact', hide: true, sort: (e) => e.phone || '',
        // Not a tel: link: the whole row opens the enquiry, and a link inside
        // it would fire both. The dialling is on the handset button at the end
        // of the row, where it cannot be hit by accident.
        cell: (e) => escapeHTML(e.phone || '—') },
      // The car the visitor chose, which the list could not see until the API
      // started sending it. See enquiry_vehicle_asked() for why the vehicle
      // join is usually empty and where the name really lives.
      { key: 'vehicle_asked', label: 'Car', hide: true,
        sort: (e) => (e.vehicle_asked || '').toLowerCase(),
        cell: (e) => (e.vehicle_asked
          ? `<span class="rec-clip" title="${escapeHTML(e.vehicle_asked)}"
               >${escapeHTML(e.vehicle_asked)}</span>`
          : '<span class="rec-none">Not specified</span>') },
      { key: 'start_date', label: 'Hire dates', hide: true, sort: (e) => e.start_date || '',
        cell: (e) => (e.start_date
          ? (e.return_date
              ? formatDateRange(e.start_date, e.return_date)
              : formatDate(e.start_date))
          : '<span class="rec-none">Not given</span>') },
      { key: 'status', label: 'Status', sort: (e) => e.status,
        cell: (e) => `<span class="status-badge status-badge-${e.status}">${e.status}</span>` },
      { key: 'booking_number', label: 'Booking', hide: true, sort: (e) => e.booking_number || '',
        cell: (e) => (e.booking_number
          ? `<span class="rec-id">${escapeHTML(e.booking_number)}</span>`
          : '<span class="rec-none">—</span>') },
      { key: 'created_at', label: 'Enquired on', cls: 'rec-when', sort: (e) => e.created_at,
        cell: (e) => formatDate(e.created_at) },
      { key: 'action', label: 'Action', cls: 'rec-act', hide: true, sort: (e) => e.id,
        cell: (e) => `<span class="rec-acts">
          <button type="button" class="rec-act-btn" data-act="open" title="Open this inquiry"
                  aria-label="Open ${escapeHTML(e.enquiry_number)}">${REC_EYE}</button>
          <a class="rec-act-btn" href="tel:${escapeHTML(e.phone)}" title="Call ${escapeHTML(e.name)}"
             aria-label="Call ${escapeHTML(e.name)}">${REC_PHONE}</a>
          <button type="button" class="rec-act-btn is-danger" data-act="delete"
                  title="Delete this inquiry"
                  aria-label="Delete ${escapeHTML(e.enquiry_number)}">${REC_BIN}</button>
        </span>` },
    ],
    onAction: (e, act) => {
      if (act === 'delete') deleteEnquiry(e);
      else openEnquiry(e.id);
    },
    onRow: (e) => openEnquiry(e.id),
  });
}

/**
 * Enquiry text is written by strangers on a public form, so it is escaped
 * everywhere it is shown rather than trusted into innerHTML.
 */
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// ---- Enquiry detail ----
//
// Opens in place of the list, the same as a booking does, so the two screens
// behave alike -- and so an enquiry can carry the same amount of detail
// without becoming a dialog you scroll.
let currentEnquiry = null;
let enquiryDetailPane = 'overview';

async function openEnquiry(id) {
  enquiryDetailPane = 'overview';
  showPanelFor('inquiries');
  const view = document.getElementById('enquiryDetailView');
  document.getElementById('inquiryListView').hidden = true;
  view.hidden = false;
  view.innerHTML = '<p class="detail-empty">Loading…</p>';
  window.scrollTo({ top: 0, behavior: 'instant' });
  await renderEnquiry(id);
}

function closeEnquiryDetail() {
  document.getElementById('enquiryDetailView').hidden = true;
  document.getElementById('inquiryListView').hidden = false;
  currentEnquiry = null;
}

async function renderEnquiry(id) {
  const view = document.getElementById('enquiryDetailView');
  let e;
  try {
    const answer = await api.enquiries.get(id);
    e = answer.enquiry;
    // Opening it is what marks it read, so the badge is right the moment the
    // page appears rather than after the next refresh of the list behind it.
    setInquiryBadge(answer.unread);
  } catch (err) {
    view.innerHTML = '<p class="detail-empty">Could not load this enquiry.</p>';
    showError(err);
    return;
  }
  currentEnquiry = e;

  const open = !['Converted', 'Rejected', 'Cancelled'].includes(e.status);
  const row = (k, v) => `<div class="info-row"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  const initials = (e.name || '?').split(/\s+/).slice(0, 2)
    .map((w) => w[0] || '').join('').toUpperCase();

  const overview = `
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('user')}</span>
          <h3>Who asked</h3>
        </div>
        ${row('Name', escapeHTML(e.name))}
        ${row('Phone', `<a href="tel:${escapeHTML(e.phone)}">${escapeHTML(e.phone)}</a>`)}
        ${row('Email', escapeHTML(e.email) || '—')}
        ${row('Received', formatDateTime(e.created_at))}
        ${row('Came from', escapeHTML(e.source || 'website'))}
      </div>

      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('car')}</span>
          <h3>What they asked for</h3>
        </div>
        ${row('Vehicle', escapeHTML(e.vehicle_name) || 'Not specified')}
        ${row('Dates', `${e.start_date ? formatDate(e.start_date) : '—'}${
          e.return_date ? ' → ' + formatDate(e.return_date) : ''}`)}
        ${row('Pickup', escapeHTML(e.pickup_location) || '—')}
        ${e.message ? `<p class="field-hint" style="margin-top:8px">“${escapeHTML(e.message)}”</p>` : ''}
        ${e.requirements ? `<p class="field-hint">${escapeHTML(e.requirements)}</p>` : ''}
      </div>

      ${e.booking_number ? `
      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('tick')}</span>
          <h3>Became a booking</h3>
        </div>
        <p class="field-hint">Accepted and booked as <strong>${escapeHTML(e.booking_number)}</strong>.</p>
        <button class="btn btn-outline btn-sm" id="enqOpenBooking" data-booking="${e.booking_id || ''}">
          Open ${escapeHTML(e.booking_number)}</button>
      </div>` : ''}
    </div>

    ${open ? `
      <div class="detail-section">
        <div class="detail-section-title"><span>Handle this enquiry</span></div>
        <div class="enquiry-actions">
          <button class="btn btn-ghost btn-sm" data-enq-status="Contacted">Mark Contacted</button>
          <button class="btn btn-ghost btn-sm" data-enq-status="Pending">Mark Pending</button>
          <button class="btn btn-ghost btn-sm" data-enq-status="Rejected">Reject</button>
          <button class="btn btn-danger btn-sm btn-icon" id="enqDelete" title="Delete this enquiry" aria-label="Delete this enquiry">${BIN_ICON}</button>
        </div>
      </div>` : ''}`;

  const notes = `
    <div class="detail-section">
      <div class="detail-section-title">
        <span>Notes</span>
        ${open ? '<button class="btn btn-outline btn-sm" id="enqAddNote">Add note</button>' : ''}
      </div>
      ${e.admin_notes
        ? `<div class="enquiry-notes">${escapeHTML(e.admin_notes)}</div>`
        : '<p class="detail-empty">No notes yet.</p>'}
    </div>`;

  view.innerHTML = `
    <button type="button" class="rec-back" id="enquiryDetailBack">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back to all inquiries
    </button>

    <div class="rec-hero">
      <div class="rec-hero-top">
        <span class="rec-avatar">${escapeHTML(initials)}</span>
        <div class="rec-hero-id">
          <h2>${escapeHTML(e.name)}
            <span class="status-badge status-badge-${e.status}">${e.status}</span></h2>
          <p class="rec-hero-sub">${escapeHTML(e.enquiry_number)} ·
            ${escapeHTML(e.phone)} · ${escapeHTML(e.source || 'website')}</p>
        </div>
        <div class="rec-hero-act">
          <a class="btn btn-ghost btn-sm" href="tel:${escapeHTML(e.phone)}">Call</a>
          ${open ? '<button class="btn btn-primary btn-sm" id="enqConvert">Accept &amp; Create Booking</button>' : ''}
        </div>
      </div>

      <div class="rec-tiles">
        <div class="rec-tile">
          <div class="rec-tile-k">Wants</div>
          <div class="rec-tile-v">${escapeHTML(e.vehicle_name) || '—'}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">From</div>
          <div class="rec-tile-v">${e.start_date ? formatDate(e.start_date) : '—'}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">Until</div>
          <div class="rec-tile-v">${e.return_date ? formatDate(e.return_date) : '—'}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">Received</div>
          <div class="rec-tile-v">${formatDate(e.created_at)}</div>
        </div>
      </div>
    </div>

    <div class="rec-tabs" role="tablist">
      <button type="button" class="rec-tab is-on" data-pane="overview">Overview</button>
      <button type="button" class="rec-tab" data-pane="notes">Notes
        <span class="n">${(e.admin_notes || '').split('\n').filter((l) => l.trim()).length}</span></button>
    </div>

    <div id="enquiryDetailBody">
      <div class="rec-pane" data-pane="overview">${overview}</div>
      <div class="rec-pane" data-pane="notes" hidden>${notes}</div>
    </div>
  `;

  document.getElementById('enquiryDetailBack').addEventListener('click', async () => {
    closeEnquiryDetail();
    await renderInquiries();
  });
  wireRecTabs(view, enquiryDetailPane, (pane) => { enquiryDetailPane = pane; });

  document.getElementById('enqOpenBooking')?.addEventListener('click', async (ev) => {
    const bookingId = Number(ev.currentTarget.dataset.booking);
    if (!bookingId) return;
    closeEnquiryDetail();
    await openBookingDetail(bookingId);
  });

  document.getElementById('enqAddNote')?.addEventListener('click', async () => {
    const note = await nsDialog.ask('The note', {
      title: 'Add a note to this enquiry',
      confirmLabel: 'Add note',
      required: true,
      placeholder: 'Called back, line busy',
    });
    if (note === null) return;
    try {
      await api.enquiries.note(e.id, note.trim());
      await renderEnquiry(e.id);
    } catch (err) { showError(err); }
  });

  document.getElementById('enqDelete')?.addEventListener('click', () => deleteEnquiry(e));

  view.querySelectorAll('[data-enq-status]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const status = btn.dataset.enqStatus;
      // Turning someone away needs a reason; the server insists, and asking
      // here means the user is not bounced back by an error.
      const needsReason = status === 'Rejected';
      const note = await nsDialog.ask(needsReason ? 'Why is this being rejected?' : 'Note (optional)', {
        title: needsReason ? 'Reject this enquiry' : `Mark as ${status}`,
        confirmLabel: needsReason ? 'Reject' : 'Save',
        tone: needsReason ? 'danger' : undefined,
        required: needsReason,
        validate: (v) => (needsReason && !v.trim()
          ? 'A reason is required to reject an enquiry.' : null),
      });
      if (note === null) return;
      try {
        await api.enquiries.status(e.id, status, note.trim());
        await renderEnquiry(e.id);
        await renderInquiries();
      } catch (err) { showError(err); }
    });
  });

  document.getElementById('enqConvert')?.addEventListener('click', () => openConvertModal(e));
}

/**
 * Accepting reuses the booking form, pre-filled from the enquiry. The
 * conversion goes through its own endpoint so the booking keeps a link back
 * to where it came from.
 */
let convertingEnquiry = null;

function openConvertModal(enquiry) {
  convertingEnquiry = enquiry;
  // The booking form opens over the enquiry, which stays where it is: if the
  // form is abandoned, the enquiry is still on screen behind it.
  openBookingModal(null);
  document.getElementById('bookingModalTitle').textContent = `Book ${enquiry.enquiry_number}`;
  document.getElementById('bookingNumberPreview').textContent =
    `Creating a booking from ${enquiry.enquiry_number} for ${enquiry.name}.`;
  document.getElementById('bkCustomerName').value = enquiry.name || '';
  document.getElementById('bkPhone').value = enquiry.phone || '';
  document.getElementById('bkAddress').value = '';
  if (enquiry.vehicle_id) {
    document.getElementById('bkVehicle').value = enquiry.vehicle_id;
    document.getElementById('bkVehicle').dispatchEvent(new Event('change'));
  }
  if (enquiry.start_date) document.getElementById('bkStartDate').value = enquiry.start_date;
  if (enquiry.return_date) document.getElementById('bkReturnDate').value = enquiry.return_date;
  updateBookingDurationPreview();
}

// ---- Finance ----
//
// Income is not entered here. It is summed from the payments already recorded
// against bookings, so this tab can never disagree with the bookings it
// summarises. What is entered here is what the business spent.

let FINANCE_SUMMARY = null;

function formatINR(amount) {
  // Coerced rather than trusted: money arrives from the API as a number, but
  // a string slipping through would format as 2000.00 instead of ₹2,000.
  const value = Number(amount) || 0;
  // The sign in front of the symbol, and a real minus rather than a hyphen.
  // A correction that takes money back off a booking is a negative row in
  // the payments list, and "₹-500" hides its own sign against the rupee
  // mark at the size this is read on a phone.
  return value < 0
    ? `\u2212\u202f₹${Math.abs(value).toLocaleString('en-IN')}`
    : `₹${value.toLocaleString('en-IN')}`;
}

/**
 * A balance, which can be owed to us or back to the customer.
 *
 * "₹-3,458" is arithmetic, not an answer. The minus sign is easy to miss on a
 * phone, and someone reading it quickly sees a number the customer still owes
 * when in fact they are owed it back. Said in words instead, in the direction
 * the money actually has to travel.
 */
function formatBalance(amount) {
  const value = Number(amount) || 0;
  if (value < 0) return `${formatINR(-value)} to return`;
  if (value === 0) return `${formatINR(0)} — settled`;
  return `${formatINR(value)} due`;
}

/** The range the Finance tab is showing, defaulting to the current month. */
function financeRange() {
  const from = document.getElementById('finFrom');
  const to = document.getElementById('finTo');
  if (from && !from.value) {
    const now = new Date();
    from.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    to.value = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  }
  return { from: from ? from.value : '', to: to ? to.value : '' };
}

function setFinanceRange(from, to) {
  document.getElementById('finFrom').value = from.toISOString().slice(0, 10);
  document.getElementById('finTo').value = to.toISOString().slice(0, 10);
  renderFinance();
}

/** A bar per row, sized against the largest, so the shape reads at a glance. */
function breakdownHTML(rows, labelOf, emptyText) {
  if (!rows.length) return `<div class="empty-state">${emptyText}</div>`;
  const top = Math.max(...rows.map((r) => Math.abs(Number(r.total) || 0)), 1);
  return rows.map((row) => {
    const value = Number(row.total) || 0;
    return `
      <div class="breakdown-row">
        <span class="breakdown-label">${escapeHTML(labelOf(row))}</span>
        <span class="breakdown-bar"><i style="width:${Math.round((Math.abs(value) / top) * 100)}%"></i></span>
        <span class="breakdown-value">${formatINR(value)}</span>
      </div>`;
  }).join('');
}

const PAYMENT_KIND_LABELS = {
  advance: 'Advance', balance: 'Balance', additional: 'Additional', extra_km: 'Extra KM',
};

/**
 * The dashboard shows these too, but without the buttons: its handlers live
 * with the Finance tab, so controls rendered there would look live and do
 * nothing.
 */
function expenseCardHTML(expense, { actions = true } = {}) {
  const voided = expense.status !== 'active';
  const where = [
    expense.vehicle_name ? `${expense.vehicle_name}${expense.reg_number ? ` (${expense.reg_number})` : ''}` : null,
    expense.vendor,
    expense.booking_number,
  ].filter(Boolean).map(escapeHTML).join(' · ');

  return `
    <div class="expense-card${voided ? ' is-voided' : ''}" data-id="${expense.id}">
      <div class="row">
        <span class="num">${escapeHTML(expense.expense_number)}</span>
        <span class="expense-what">${escapeHTML(expense.description || expense.category)}</span>
        <span class="meta">
          ${escapeHTML(expense.category)} · ${escapeHTML(expense.method)}${where ? ` · ${where}` : ''}
        </span>
        ${expense.corrects_number
          ? `<span class="meta corrects">Corrects ${escapeHTML(expense.corrects_number)}</span>` : ''}
        ${expense.status_reason
          ? `<span class="meta reason">${escapeHTML(expense.status_reason)}</span>` : ''}
      </div>
      <div class="right">
        ${expense.approval_state === 'pending' && !voided
          ? '<span class="status-badge status-badge-Pending">Awaiting approval</span>' : ''}
        ${expense.approval_state === 'rejected'
          ? '<span class="status-badge status-badge-Rejected">Rejected</span>' : ''}
        ${voided ? `<span class="status-badge status-badge-Cancelled">${escapeHTML(expense.status)}</span>` : ''}
        <span class="expense-amount">${formatINR(expense.amount)}</span>
        <span class="meta">${formatDate(expense.spent_on)}</span>
        ${voided || !actions ? '' : `
          <span class="expense-actions">
            ${expense.approval_state === 'pending'
              ? '<button class="link-btn approve-expense">Approve</button>' : ''}
            <button class="link-btn correct-expense">Correct</button>
            <button class="link-btn danger void-expense">Void</button>
          </span>`}
      </div>
    </div>`;
}

async function renderFinance() {
  const wrap = document.getElementById('expensesWrap');
  if (!wrap) return;

  const range = financeRange();
  const showVoided = document.getElementById('finShowVoided')?.checked === true;

  let summary;
  let expenses;
  try {
    [summary, expenses] = await Promise.all([
      api.expenses.summary(range),
      api.expenses.list({ ...range, includeVoided: showVoided }),
    ]);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">Could not load finance: ${escapeHTML(err.message)}</div>`;
    return;
  }
  FINANCE_SUMMARY = summary;

  document.getElementById('financeIncome').textContent = formatINR(summary.income.total);
  document.getElementById('financeExpense').textContent = formatINR(summary.expenses.total);
  document.getElementById('financeBalance').textContent = formatINR(summary.net);

  document.getElementById('financeIncomeFoot').textContent =
    summary.income.by_kind.map((k) => `${PAYMENT_KIND_LABELS[k.kind] || k.kind} ${formatINR(k.total)}`).join(' · ');

  const pending = summary.expenses.pending_approval;
  document.getElementById('financeExpenseFoot').textContent =
    pending.count ? `${pending.count} awaiting approval (${formatINR(pending.total)})` : '';
  document.getElementById('financeBalanceFoot').textContent =
    Number(summary.net) < 0 ? 'Spent more than was taken in' : '';

  // Said plainly rather than folded into the figures: a deposit is the
  // customer's money being held, and counting it as income would overstate
  // what the business actually earned.
  const deposits = summary.deposits;
  document.getElementById('financeDepositNote').textContent =
    (Number(deposits.received) || Number(deposits.refunded))
      ? `Deposits are not income: ${formatINR(deposits.received)} taken and `
        + `${formatINR(deposits.refunded)} returned in this period.`
      : '';

  document.getElementById('financeByMethod').innerHTML =
    breakdownHTML(summary.income.by_method, (r) => `${r.method} (${r.count})`, 'No payments in this period.');
  document.getElementById('financeByCategory').innerHTML =
    breakdownHTML(summary.expenses.by_category, (r) => `${r.category} (${r.count})`, 'No expenses in this period.');
  document.getElementById('financeByVehicle').innerHTML =
    breakdownHTML(summary.expenses.by_vehicle, (r) => `${r.name} (${r.reg_number})`, 'No vehicle costs in this period.');

  wrap.innerHTML = expenses.expenses.length
    ? expenses.expenses.map(expenseCardHTML).join('')
    : '<div class="empty-state">No expenses recorded in this period.</div>';

  wrap.querySelectorAll('.void-expense').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = Number(e.target.closest('.expense-card').dataset.id);
      const reason = await nsDialog.ask('Why is this expense being voided?', {
        title: 'Void this expense',
        body: 'The entry stays on file and stops counting. It is not deleted.',
        confirmLabel: 'Void it',
        tone: 'danger',
        required: true,
      });
      if (!reason) return;
      await guardedCall(() => api.expenses.void(id, reason));
    });
  });

  wrap.querySelectorAll('.correct-expense').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = Number(e.target.closest('.expense-card').dataset.id);
      const amount = await nsDialog.ask('Adjustment (\u20b9)', {
        title: 'Correct this expense',
        body: 'Positive if too little was recorded, negative if too much. '
            + 'The original entry stays on file.',
        confirmLabel: 'Next',
        type: 'number',
        placeholder: '-250',
        required: true,
        validate: (v) => (Number.isFinite(Number(v)) && Number(v) !== 0
          ? null : 'A number, and not zero.'),
      });
      if (amount === null || amount.trim() === '') return;
      const reason = await nsDialog.ask('Why is it being corrected?', {
        title: 'Correct this expense',
        confirmLabel: 'Correct it',
        required: true,
      });
      if (!reason) return;
      await guardedCall(() => api.expenses.correct({ corrects_id: id, amount, reason }));
    });
  });

  wrap.querySelectorAll('.approve-expense').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = Number(e.target.closest('.expense-card').dataset.id);
      if (!await nsDialog.confirm('It counts against the books once it is approved.', {
        title: 'Approve this expense?',
        confirmLabel: 'Approve',
      })) return;
      await guardedCall(() => api.expenses.approve(id, 'approved', ''));
    });
  });
}

/** Runs a write, reports what went wrong in words, and repaints on success. */
async function guardedCall(fn) {
  try {
    await fn();
    await renderFinance();
    await renderOverview();
  } catch (err) {
    nsDialog.tell(err.message, { title: 'That did not go through' });
  }
}

function openExpenseModal() {
  const form = document.getElementById('expenseForm');
  form.reset();
  document.getElementById('expenseFormError').textContent = '';
  document.getElementById('expDate').value = new Date().toISOString().slice(0, 10);

  const select = document.getElementById('expVehicle');
  select.innerHTML = '<option value="">Not vehicle-specific</option>'
    + loadCars().map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');

  document.getElementById('expenseModalOverlay').hidden = false;
}

function closeExpenseModal() {
  document.getElementById('expenseModalOverlay').hidden = true;
}

// ---- Finance wiring ----
hideUnless('expense.create', 'addExpenseBtn');
document.getElementById('addExpenseBtn')?.addEventListener('click', openExpenseModal);
document.getElementById('expenseModalCancel')?.addEventListener('click', closeExpenseModal);
document.getElementById('expenseModalClose')?.addEventListener('click', closeExpenseModal);
document.getElementById('finShowVoided')?.addEventListener('change', renderFinance);
document.getElementById('finFrom')?.addEventListener('change', renderFinance);
document.getElementById('finTo')?.addEventListener('change', renderFinance);

document.getElementById('finThisMonth')?.addEventListener('click', () => {
  const now = new Date();
  setFinanceRange(new Date(now.getFullYear(), now.getMonth(), 1),
                  new Date(now.getFullYear(), now.getMonth() + 1, 0));
});
document.getElementById('finLastMonth')?.addEventListener('click', () => {
  const now = new Date();
  setFinanceRange(new Date(now.getFullYear(), now.getMonth() - 1, 1),
                  new Date(now.getFullYear(), now.getMonth(), 0));
});
document.getElementById('finThisYear')?.addEventListener('click', () => {
  const now = new Date();
  setFinanceRange(new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31));
});

document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = document.getElementById('expenseFormError');
  error.textContent = '';

  const vehicleId = document.getElementById('expVehicle').value;
  try {
    await api.expenses.save({
      amount: document.getElementById('expAmount').value,
      spent_on: document.getElementById('expDate').value,
      category: document.getElementById('expCategory').value,
      method: document.getElementById('expMethod').value,
      description: document.getElementById('expDescription').value.trim(),
      vendor: document.getElementById('expVendor').value.trim(),
      vehicle_id: vehicleId ? Number(vehicleId) : null,
    });
  } catch (err) {
    // Field-level messages belong beside the form, not in a dialog that
    // disappears the moment it is dismissed.
    error.textContent = err.fields
      ? Object.values(err.fields).join(' ')
      : err.message;
    return;
  }

  closeExpenseModal();
  await renderFinance();
  await renderOverview();
});

// ---- Dashboard overview ----
async function renderOverview() {
  const carCountEl = document.getElementById('statCarCount');
  if (!carCountEl) return;

  const cars = loadCars();

  // The dashboard shows the current month, which is the figure someone means
  // when they ask how the business is doing.
  let money = { income: { total: 0 }, expenses: { total: 0, pending_approval: { count: 0 } }, net: 0 };
  // Not asked for at all without the permission to see it: the figures below
  // are hidden in that case, and asking anyway would log a refusal.
  if (can('report.view')) {
    try {
      money = await api.expenses.summary({});
      FINANCE_SUMMARY = money;
    } catch {
      // The rest of the dashboard should still paint if this one call fails.
    }
  }

  // Enquiries still needing attention, rather than every one ever received —
  // a count that only ever grows tells you nothing.
  let inquiries = [];
  if (can('enquiry.view')) {
    try {
      inquiries = (await api.enquiries.list()).enquiries
        .filter((e) => ['New', 'Contacted', 'Pending'].includes(e.status));
    } catch {
      // The dashboard should still render its other figures if this one fails.
    }
  }

  carCountEl.textContent = cars.length;
  document.getElementById('statInquiryCount').textContent = inquiries.length;
  document.getElementById('statIncome').textContent = formatINR(money.income.total);
  document.getElementById('statExpense').textContent = formatINR(money.expenses.total);
  document.getElementById('statBalance').textContent = formatINR(money.net);

  // A zero is a figure, and a figure somebody will act on. An account that
  // may not see the money must be shown nothing rather than ₹0.
  hideUnless('report.view', 'statIncome', 'statExpense', 'statBalance');
  hideUnless('vehicle.view', 'statCarCount');
  hideUnless('enquiry.view', 'statInquiryCount', 'recentInquiries');
  hideUnless('expense.view', 'recentTransactions');

  const recentInquiries = document.getElementById('recentInquiries');
  recentInquiries.innerHTML = inquiries.length
    ? inquiries.slice(0, 5).map((inq) => `
      <div class="inquiry-card">
        <div class="inquiry-info">
          <span class="inquiry-name">${escapeHTML(inq.name)}</span>
          <span class="inquiry-detail">${escapeHTML(inq.phone)}${inq.vehicle_name ? ` · ${escapeHTML(inq.vehicle_name)}` : ''}</span>
        </div>
        <span class="inquiry-time">${formatDate(inq.created_at)}</span>
      </div>`).join('')
    : '<div class="empty-state">No inquiries yet.</div>';

  const recentTransactions = document.getElementById('recentTransactions');
  let recent = [];
  if (can('expense.view')) {
    try {
      recent = (await api.expenses.list({})).expenses.slice(0, 5);
    } catch {
      // Same again: a failure here should not take the whole dashboard down.
    }
  }
  recentTransactions.innerHTML = recent.length
    ? recent.map((e) => expenseCardHTML(e, { actions: false })).join('')
    : '<div class="empty-state">No expenses this month.</div>';

  renderRentalOverview();
}

// ==========================================================================
// Bookings / Rental Management
// ==========================================================================

// Bookings come from the server. They are cached per page load so the
// dashboard and reports can read them synchronously, and refreshed whenever
// anything changes.
let BOOKING_CACHE = [];

async function refreshBookings(status = '') {
  const data = await api.bookings.list(status);
  BOOKING_CACHE = data.bookings;
  return BOOKING_CACHE;
}

/** Synchronous read of the cached bookings, for the render code. */
function loadBookings() {
  return BOOKING_CACHE.slice();
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * A date range written the way somebody says it out loud.
 *
 * "14 Oct 2026 → 16 Oct 2026" says the month twice and the year twice, and
 * those twelve repeated characters were enough to wrap the Dates column onto
 * a second line. What repeats is said once: 14–16 Oct 2026 for a trip inside
 * one month, 29 Sep → 29 Oct 2026 across two, and both years in full only
 * when the hire actually crosses one.
 */
function formatDateRange(from, to) {
  const start = parseWhen(from);
  const end = parseWhen(to);
  if (!start || !end) return `${formatDate(from)} → ${formatDate(to)}`;

  const day = (d) => String(d.getDate()).padStart(2, '0');
  const month = (d) => d.toLocaleDateString('en-IN', { month: 'short' });

  // A hire over New Year is the one case where both years have to be said.
  // Two digits each: "29 Dec 26 → 03 Jan 27" is the same fact as the long form
  // and forty pixels narrower, and no one is booking a car in 1926.
  if (start.getFullYear() !== end.getFullYear()) {
    const yy = (d) => String(d.getFullYear()).slice(-2);
    return `${day(start)} ${month(start)} ${yy(start)} → ${day(end)} ${month(end)} ${yy(end)}`;
  }
  // This year is the year almost every booking on the screen is in, and a year
  // that never changes is a year nobody reads. It comes back the moment the
  // hire is in a different one, which is the only time it tells you anything.
  const year = start.getFullYear() === new Date().getFullYear() ? '' : ` ${start.getFullYear()}`;

  if (start.getMonth() === end.getMonth()) {
    return day(start) === day(end)
      ? `${day(start)} ${month(start)}${year}`
      : `${day(start)}–${day(end)} ${month(end)}${year}`;
  }
  return `${day(start)} ${month(start)} → ${day(end)} ${month(end)}${year}`;
}

/** A MySQL datetime as a Date, or null. The T is for Safari, which needs it. */
function parseWhen(value) {
  if (!value) return null;
  const when = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(when.getTime()) ? null : when;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function vehicleLabel(vehicleId) {
  const car = loadCars().find((c) => c.id === vehicleId);
  return car ? car.name : '(vehicle removed)';
}

function populateVehicleSelect(selectEl, selectedId) {
  const cars = loadCars();
  selectEl.innerHTML = cars
    .map((c) => `<option value="${c.id}">${c.name} (${c.regNumber || 'no reg. no.'})</option>`)
    .join('');
  if (selectedId) selectEl.value = selectedId;
}

/** Splits a MySQL datetime into the date and time a form field expects. */
function splitDateTime(value) {
  if (!value) return ['', ''];
  const [date, time = ''] = String(value).replace('T', ' ').split(' ');
  return [date, time.slice(0, 5)];
}

// ---- Deleting a record ---------------------------------------------------
//
// In one place, because the list and the record itself both offer it and they
// have to ask the same question and do the same thing.

/**
 * Deletes a booking, after saying what goes with it.
 *
 * Everything the booking works out goes too -- its charges, the payments
 * against it, the deposit, the readings, the extras and the photographs --
 * so Finance and the reports stop counting a booking that is not there. That
 * is the point of deleting one, and it is also the thing worth spelling out
 * before anybody presses the button.
 */
async function deleteBooking(booking) {
  const goes = [
    `The rental of <strong>${formatINR(booking.total)}</strong> stops being counted`,
  ];
  if (Number(booking.paid) > 0) {
    goes.push(`<strong>${formatINR(booking.paid)}</strong> in recorded payments is removed from income`);
  }
  if (Number(booking.deposit_held) > 0) {
    goes.push(`<strong>${formatINR(booking.deposit_held)}</strong> held as a deposit stops showing as held`);
  }
  goes.push('Its odometer readings, extras, damage notes and photographs go with it');
  goes.push('Any expense recorded against it keeps its amount and loses the link');
  goes.push('The audit trail keeps a note that it existed and who removed it');

  const yes = await askToConfirm({
    title: `Delete ${booking.booking_number}?`,
    lead: `<strong>${escapeHTML(booking.customer_name)}</strong> · ${escapeHTML(booking.vehicle_name || '')}`
        + ` · ${formatDate(booking.start_at)} → ${formatDate(booking.return_at)}`,
    points: goes,
    confirmLabel: 'Delete the booking',
  });
  if (!yes) return;

  try {
    await api.bookings.remove(booking.id);
    if (currentDetailBookingId === booking.id) closeBookingDetail();
    await refreshAfterBookingChange();
    await renderInquiries();
  } catch (err) { showError(err); }
}

/** Deletes an enquiry, after naming it. */
async function deleteEnquiry(enquiry) {
  const yes = await askToConfirm({
    title: `Delete ${enquiry.enquiry_number}?`,
    lead: `<strong>${escapeHTML(enquiry.name)}</strong> · ${escapeHTML(enquiry.phone)}`
        + (enquiry.created_at ? ` · received ${formatDate(enquiry.created_at)}` : ''),
    points: [
      'What they asked for, and any notes kept on it, go with it',
      'The audit trail keeps a note that it existed and who removed it',
    ],
    confirmLabel: 'Delete the inquiry',
  });
  if (!yes) return;

  try {
    await api.enquiries.remove(enquiry.id);
    if (currentEnquiry && currentEnquiry.id === enquiry.id) closeEnquiryDetail();
    await renderInquiries();
  } catch (err) { showError(err); }
}

// ---- Are you sure? -------------------------------------------------------
//
// One dialog for everything that cannot be undone. A browser confirm() puts
// one unstyled line in front of you and calls that consent; what is actually
// needed is the name of the thing and a list of what goes with it -- deleting
// a booking takes its payments, its deposit and its readings too, and nobody
// should have to already know that.
//
// This was that dialog, with its own markup in dashboard.php and its own
// open-and-resolve code here. It is dialog.js now, which is the same dialog
// written once for the whole panel; what is left is the shape its callers
// already pass.

function askToConfirm({ title, lead, points = [], confirmLabel = 'Delete' }) {
  return nsDialog.confirm('', {
    title,
    body: lead,
    bodyIsHtml: true,
    points,
    footnote: 'This cannot be undone.',
    confirmLabel,
    tone: 'danger',
  });
}

// ---- The records shape: counts, chips, a sortable table, a pager ---------
//
// Bookings and Inquiries are the same kind of screen -- a list of records
// that each open into a page of their own -- so they are drawn by the same
// four functions rather than by two sets of nearly-identical ones.

const REC_ICONS = {
  book: '<path d="M4 3h9a2 2 0 0 1 2 2v11H6a2 2 0 0 0-2 2V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  clock: '<circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 5.5V9l2.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  car: '<path d="M3 11h12M4.5 11l1.2-3.4A1.5 1.5 0 0 1 7.1 6.6h3.8a1.5 1.5 0 0 1 1.4 1L13.5 11v3h-2v-1.5h-5V14h-2v-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  tick: '<circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 9.2l2 2 4-4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  rupee: '<path d="M6 4h6M6 7h6M11 4c0 2-1.5 3-3.5 3H6l5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  inbox: '<path d="M3 10.5 4.7 4.4A1.5 1.5 0 0 1 6.1 3.3h5.8a1.5 1.5 0 0 1 1.4 1.1L15 10.5V14H3v-3.5zM3 10.5h3l1 2h4l1-2h3" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  phone: '<path d="M5.4 3.5 7 6l-1.3 1.4a8 8 0 0 0 4 4L11 10l2.5 1.6-.6 2.2a8.6 8.6 0 0 1-9.1-9.1l2.2-.6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  star: '<path d="m9 3 1.9 3.9 4.1.6-3 2.9.7 4.1L9 12.6 5.3 14.5l.7-4.1-3-2.9 4.1-.6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  cross: '<circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M6.8 6.8l4.4 4.4M11.2 6.8l-4.4 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  user: '<circle cx="9" cy="6.5" r="2.8" stroke="currentColor" stroke-width="1.5"/><path d="M3.8 15c.7-2.6 2.7-4 5.2-4s4.5 1.4 5.2 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  building: '<path d="M4 15V4.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V15M11 15V8h2.5a1 1 0 0 1 1 1v6M3 15h12M6.2 6.5h2.6M6.2 9h2.6M6.2 11.5h2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
};

const REC_EYE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
  + '<path d="M1.5 8S3.8 3.8 8 3.8 14.5 8 14.5 8 12.2 12.2 8 12.2 1.5 8 1.5 8z" stroke="currentColor" stroke-width="1.4"/>'
  + '<circle cx="8" cy="8" r="1.9" stroke="currentColor" stroke-width="1.4"/></svg>';
const REC_BIN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
  + '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8"'
  + ' stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const REC_PENCIL = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
  + '<path d="M11.2 2.6l2.2 2.2L5.9 12.3l-3 .8.8-3 7.5-7.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
const REC_PHONE = '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">'
  + REC_ICONS.phone + '</svg>';

function recIcon(name) {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">${
    REC_ICONS[name] || REC_ICONS.book}</svg>`;
}

/** The row of counts above the filters. */
function renderRecStats(id, cards) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = cards.map((c) => `
    <div class="rec-stat${c.tone ? ' rec-stat-' + c.tone : ''}">
      <div>
        <div class="rec-stat-n">${c.n}</div>
        <div class="rec-stat-k">${escapeHTML(c.k)}</div>
      </div>
      <span class="rec-stat-ico">${recIcon(c.icon)}</span>
    </div>`).join('');
}

/**
 * The filter chips, each carrying its own count.
 *
 * Rebuilt on every render rather than wired once: the counts change with the
 * data, and a chip that says 3 when there are 4 is worse than no chip.
 */
function renderRecChips(id, chips, active, onPick) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = chips.map((c) => `
    <button type="button" class="rec-chip${c.value === active ? ' is-on' : ''}"
            data-chip="${escapeHTML(c.value)}" aria-pressed="${c.value === active}">
      <span class="dot"></span>${escapeHTML(c.label)}<span class="n">${c.n}</span>
    </button>`).join('');
  el.querySelectorAll('.rec-chip').forEach((chip) => {
    chip.addEventListener('click', () => onPick(chip.dataset.chip));
  });
}

/**
 * The table itself: sorting by any column, a page at a time.
 *
 * Sorting and paging are done here and not on the server because the whole
 * list is already in hand -- a rental business has hundreds of bookings a
 * year, not millions -- and a round trip per click would be slower than the
 * click.
 */
function renderRecTable(opts) {
  // noun is a pair -- ["inquiry", "inquiries"] -- because adding an s to
  // everything gets you "6 inquirys" at the bottom of the screen.
  const { wrap, pagerId, view, rows, columns, noun, empty, onRow, rowClass } = opts;
  const pager = document.getElementById(pagerId);

  if (!rows.length) {
    wrap.innerHTML = `<div class="empty-state">${escapeHTML(empty)}</div>`;
    if (pager) pager.hidden = true;
    return;
  }

  const column = columns.find((c) => c.key === view.sort) || columns[0];
  const dir = view.dir === 'asc' ? 1 : -1;
  const sorted = rows.slice().sort((a, b) => {
    const x = column.sort(a);
    const y = column.sort(b);
    if (x === y) return 0;
    return (x > y ? 1 : -1) * dir;
  });

  const pages = Math.max(1, Math.ceil(sorted.length / view.perPage));
  view.page = Math.min(Math.max(1, view.page), pages);
  const from = (view.page - 1) * view.perPage;
  const page = sorted.slice(from, from + view.perPage);

  wrap.innerHTML = `
    <div class="rec-tablewrap">
      <table class="rec-table">
        <thead>
          <tr>
            <th class="rec-sno">S. No</th>
            ${columns.map((c) => `
              <th class="is-sortable${c.key === view.sort ? ' is-sorted' : ''}${
                  c.hide ? ' rec-hide-sm' : ''}${
                  // The column's own class on the heading as well as the cells.
                  // Width, alignment and -- the reason it was added -- being
                  // pinned to an edge are properties of the column, and a
                  // heading that does not share them slides off on its own.
                  c.cls ? ` ${c.cls}` : ''}" data-sort="${c.key}"
                  aria-sort="${c.key === view.sort ? (view.dir === 'asc' ? 'ascending' : 'descending') : 'none'}">
                ${escapeHTML(c.label)}<span class="ord">${
                  c.key === view.sort ? (view.dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
              </th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${page.map((row, i) => `
            <tr data-id="${row.id}" class="${rowClass ? rowClass(row) : ''}">
              <td class="rec-sno">${from + i + 1}</td>
              ${columns.map((c) => `<td class="${c.cls || ''}${c.hide ? ' rec-hide-sm' : ''}">${
                  c.cell(row)}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  // Whether the pinned Action column has anything sliding under it. CSS
  // cannot ask that question, and the answer changes with the window, with
  // the sidebar, and with the longest name in the current page of rows.
  const box = wrap.querySelector('.rec-tablewrap');
  const table = box.querySelector('.rec-table');
  const markOverflow = () => {
    box.classList.toggle('has-overflow-x', table.scrollWidth > box.clientWidth + 1);
  };
  markOverflow();
  new ResizeObserver(markOverflow).observe(box);

  wrap.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      // Clicking the column you are already sorted by turns it round; a
      // different column starts ascending, which is what "sort by name" means.
      if (view.sort === key) {
        view.dir = view.dir === 'asc' ? 'desc' : 'asc';
      } else {
        view.sort = key;
        view.dir = 'asc';
      }
      opts.rerender ? opts.rerender() : renderRecTable(opts);
    });
  });

  wrap.querySelectorAll('tbody tr').forEach((tr) => {
    tr.addEventListener('click', (ev) => {
      const row = page.find((r) => String(r.id) === tr.dataset.id);
      if (!row) return;
      // A link in the row -- ringing the number -- is the browser's job.
      if (ev.target.closest('a[href]')) return;
      const act = ev.target.closest('[data-act]');
      if (act && opts.onAction) { opts.onAction(row, act.dataset.act); return; }
      onRow(row);
    });
  });

  if (!pager) return;
  pager.hidden = false;
  pager.innerHTML = `
    <label class="rec-pager-left">Per page
      <select data-per-page>
        ${[10, 20, 30, 50, 100].map((n) =>
          `<option value="${n}"${n === view.perPage ? ' selected' : ''}>${n}</option>`).join('')}
      </select>
    </label>
    <span>Total ${sorted.length} ${escapeHTML(sorted.length === 1 ? noun[0] : noun[1])}</span>
    <span class="rec-pager-right">
      <button type="button" class="btn btn-ghost btn-sm" data-page="prev"${
        view.page === 1 ? ' disabled' : ''}>Back</button>
      <span class="page-of">Page ${view.page} of ${pages}</span>
      <button type="button" class="btn btn-ghost btn-sm" data-page="next"${
        view.page === pages ? ' disabled' : ''}>Next</button>
    </span>`;

  pager.querySelector('[data-per-page]').addEventListener('change', (e) => {
    view.perPage = Number(e.target.value);
    view.page = 1;
    opts.rerender ? opts.rerender() : renderRecTable(opts);
  });
  pager.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      view.page += btn.dataset.page === 'next' ? 1 : -1;
      opts.rerender ? opts.rerender() : renderRecTable(opts);
    });
  });
}

// ---- Booking list ----
//
// The counts, the filter chips and the table all come from one fetch of every
// booking, filtered here. It is a few dozen rows, and doing it this way is
// what lets a chip carry its own count: a number taken from a list the server
// has already filtered would be counting the rows on screen.

let bookingStatusFilter = 'all';
let bookingSearch = '';
const bookingView = { sort: 'start_at', dir: 'desc', page: 1, perPage: 30 };

const BOOKING_CHIPS = [
  ['all', 'All'], ['Confirmed', 'Confirmed'], ['Active', 'On rental'],
  ['Completed', 'Completed'], ['Cancelled', 'Cancelled'],
];

document.getElementById('bookingSearch')?.addEventListener('input', debounce((e) => {
  bookingSearch = e.target.value.trim();
  bookingView.page = 1;
  renderBookingList();
}, 250));

document.getElementById('bookingReset')?.addEventListener('click', () => {
  bookingSearch = '';
  bookingStatusFilter = 'all';
  bookingView.page = 1;
  const box = document.getElementById('bookingSearch');
  if (box) box.value = '';
  renderBookingList();
});

/** Waits for the typing to stop. A request per keystroke is a lot of queries. */
function debounce(fn, ms) {
  let timer = null;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function bookingMatches(b, needle) {
  if (!needle) return true;
  const hay = [b.booking_number, b.customer_name, b.customer_phone, b.vehicle_name, b.vehicle_reg]
    .join(' ').toLowerCase();
  return hay.includes(needle.toLowerCase());
}

async function renderBookingList() {
  const wrap = document.getElementById('bookingListWrap');
  const countBadge = document.getElementById('bookingCount');
  if (!wrap) return;

  try {
    await refreshBookings('');
  } catch (err) {
    wrap.innerHTML = '<div class="empty-state">Could not load bookings.</div>';
    showError(err);
    return;
  }

  const all = loadBookings();
  if (countBadge) countBadge.textContent = all.length || '';

  const by = (status) => all.filter((b) => b.status === status).length;
  renderRecStats('bookingStats', [
    { n: all.length, k: 'Total', icon: 'book' },
    { n: by('Confirmed'), k: 'Upcoming', icon: 'clock' },
    { n: by('Active'), k: 'On rental', icon: 'car' },
    { n: by('Completed'), k: 'Completed', icon: 'tick', tone: 'good' },
    { n: all.filter((b) => Number(b.balance) > 0 && b.status !== 'Cancelled').length,
      k: 'Payment due', icon: 'rupee', tone: 'danger' },
  ]);

  renderRecChips('bookingChips', BOOKING_CHIPS.map(([value, label]) => ({
    value, label,
    n: value === 'all' ? all.length : by(value),
  })), bookingStatusFilter, (value) => {
    bookingStatusFilter = value;
    bookingView.page = 1;
    renderBookingList();
  });

  const rows = all
    .filter((b) => bookingStatusFilter === 'all' || b.status === bookingStatusFilter)
    .filter((b) => bookingMatches(b, bookingSearch));

  renderRecTable({
    wrap,
    pagerId: 'bookingPager',
    view: bookingView,
    rows,
    noun: ['booking', 'bookings'],
    empty: all.length
      ? 'No bookings match that.'
      : 'No bookings yet. Click "+ New Booking" to create one.',
    columns: [
      { key: 'booking_number', label: 'Booking No.', hide: true, sort: (b) => b.booking_number,
        cell: (b) => `<span class="rec-id">${escapeHTML(b.booking_number)}</span>` },
      // One heading per thing, the same as the enquiries list. Customer used
      // to carry the phone, Vehicle the registration and Dates the duration,
      // which left three of the booking's facts with no heading over them.
      // The box scrolls, so they can each have a column.
      { key: 'customer_name', label: 'Customer', sort: (b) => b.customer_name.toLowerCase(),
        cell: (b) => `<span class="rec-who rec-clip" title="${escapeHTML(b.customer_name)}"
                        >${escapeHTML(b.customer_name)}</span>
                      <div class="rec-sub rec-id rec-only-sm">${escapeHTML(b.booking_number)}</div>` },
      { key: 'customer_phone', label: 'Contact', hide: true, sort: (b) => b.customer_phone || '',
        cell: (b) => escapeHTML(b.customer_phone || '—') },
      { key: 'vehicle_name', label: 'Vehicle', hide: true, sort: (b) => (b.vehicle_name || '').toLowerCase(),
        cell: (b) => (b.vehicle_name
          ? `<span class="rec-clip" title="${escapeHTML(b.vehicle_name)}"
               >${escapeHTML(b.vehicle_name)}</span>`
          : '<span class="rec-none">—</span>') },
      { key: 'vehicle_reg', label: 'Reg. no.', hide: true, sort: (b) => (b.vehicle_reg || '').toLowerCase(),
        cell: (b) => escapeHTML(b.vehicle_reg || '—') },
      { key: 'start_at', label: 'Hire dates', hide: true, sort: (b) => b.start_at,
        cell: (b) => formatDateRange(b.start_at, b.return_at) },
      { key: 'duration_days', label: 'Days', hide: true, sort: (b) => Number(b.duration_days),
        cell: (b) => `${b.duration_days} day${Number(b.duration_days) === 1 ? '' : 's'}` },
      { key: 'status', label: 'Status', sort: (b) => b.status,
        cell: (b) => `<span class="rec-line-chips">
                        <span class="status-badge status-badge-${b.status}">${b.status}</span>
                        ${scheduleChipHTML(b, { quiet: true })}
                      </span>` },
      { key: 'balance', label: 'Balance', sort: (b) => Number(b.balance), cls: 'rec-money',
        cell: (b) => formatBalance(b.balance) },
      { key: 'action', label: 'Action', cls: 'rec-act', hide: true, sort: (b) => b.id,
        cell: (b) => `<span class="rec-acts">
          <button type="button" class="rec-act-btn" data-act="open" title="Open this booking"
                  aria-label="Open ${escapeHTML(b.booking_number)}">${REC_EYE}</button>
          ${b.status === 'Completed' || b.status === 'Cancelled' ? '' : `
          <button type="button" class="rec-act-btn" data-act="edit" title="Edit this booking"
                  aria-label="Edit ${escapeHTML(b.booking_number)}">${REC_PENCIL}</button>`}
          <button type="button" class="rec-act-btn is-danger" data-act="delete"
                  title="Delete this booking"
                  aria-label="Delete ${escapeHTML(b.booking_number)}">${REC_BIN}</button>
        </span>` },
    ],
    onAction: (b, act) => {
      if (act === 'edit') openBookingModal(b);
      else if (act === 'delete') deleteBooking(b);
      else openBookingDetail(b.id);
    },
    onRow: (b) => openBookingDetail(b.id),
  });
}

// ---- Booking create/edit modal ----
const bookingModalOverlay = document.getElementById('bookingModalOverlay');
const bookingForm = document.getElementById('bookingForm');
const bookingVehicleSelect = document.getElementById('bkVehicle');

function bookingFormDateTimes() {
  const startDate = document.getElementById('bkStartDate').value;
  const startTime = document.getElementById('bkStartTime').value || '10:00';
  const returnDate = document.getElementById('bkReturnDate').value;
  const returnTime = document.getElementById('bkReturnTime').value || '10:00';
  return [`${startDate} ${startTime}`, `${returnDate} ${returnTime}`];
}

function updateBookingDurationPreview() {
  const [startAt, returnAt] = bookingFormDateTimes();
  const start = new Date(startAt.replace(' ', 'T'));
  const end = new Date(returnAt.replace(' ', 'T'));
  let days = 1;
  if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
    days = Math.max(1, Math.ceil((end - start) / 86400000));
  }
  document.getElementById('bkDurationPreview').textContent = `${days} day${days === 1 ? '' : 's'}`;
  return days;
}

['bkStartDate', 'bkStartTime', 'bkReturnDate', 'bkReturnTime'].forEach((id) => {
  document.getElementById(id).addEventListener('change', updateBookingDurationPreview);
});

bookingVehicleSelect.addEventListener('change', () => {
  const car = loadCars().find((c) => c.id === Number(bookingVehicleSelect.value));
  if (!car) return;
  document.getElementById('bkVehicleReg').value = car.regNumber || '';
  document.getElementById('bkKmLimit').value = car.kmLimitPerDay;
  document.getElementById('bkExtraKmRate').value = car.extraKmRate;
});

function openBookingModal(booking) {
  bookingForm.reset();
  historyFor = '';
  document.getElementById('customerHistory')?.remove();
  populateVehicleSelect(bookingVehicleSelect, booking ? booking.vehicle_id : null);
  document.getElementById('bookingId').value = booking ? booking.id : '';
  document.getElementById('bookingModalTitle').textContent = booking ? 'Edit Booking' : 'New Booking';
  document.getElementById('bookingNumberPreview').textContent = booking
    ? `Booking Number: ${booking.booking_number}`
    : 'Booking number is allocated when the booking is saved.';
  document.getElementById('bookingConflictError').textContent = '';

  if (booking) {
    const [sd, st] = splitDateTime(booking.start_at);
    const [rd, rt] = splitDateTime(booking.return_at);
    document.getElementById('bkCustomerName').value = booking.customer_name || '';
    document.getElementById('bkPhone').value = booking.customer_phone || '';
    document.getElementById('bkAddress').value = booking.customer_address || '';
    document.getElementById('bkLicence').value = booking.licence_number || '';
    document.getElementById('bkWhatsapp').value = booking.whatsapp || '';
    document.getElementById('bkLicenceExpiry').value = booking.licence_expiry || '';
    document.getElementById('bkIdNumber').value = booking.id_number || '';
    document.getElementById('bkCustomerType').value = booking.customer_type || 'New';
    document.getElementById('bkEstimatedKm').value = booking.estimated_km ?? '';
    document.getElementById('bkStartDate').value = sd;
    document.getElementById('bkStartTime').value = st;
    document.getElementById('bkReturnDate').value = rd;
    document.getElementById('bkReturnTime').value = rt;
    document.getElementById('bkRentalAmount').value = booking.charges ? booking.charges.base_rental : '';
    document.getElementById('bkKmLimit').value = booking.charges ? booking.charges.km_limit_per_day : 200;
    document.getElementById('bkExtraKmRate').value = booking.charges ? booking.charges.extra_km_rate : 0;
    document.getElementById('bkNotes').value = booking.notes || '';
    document.getElementById('bkVehicleReg').value = booking.vehicle_reg || '';
    document.getElementById('bkCommission').value =
      booking.charges && booking.charges.commission ? booking.charges.commission : '';
    document.getElementById('bkDiscount').value =
      booking.charges && booking.charges.discount ? booking.charges.discount : '';
    document.getElementById('bkOtherCharges').value =
      booking.charges && booking.charges.other_charges ? booking.charges.other_charges : '';
    document.getElementById('bkReferral').value = booking.referral_source || '';
    document.getElementById('bkBalanceDue').value = booking.balance_due_on || '';
  } else {
    document.getElementById('bkStartTime').value = '10:00';
    document.getElementById('bkReturnTime').value = '10:00';
    bookingVehicleSelect.dispatchEvent(new Event('change'));
  }

  updateBookingDurationPreview();
  syncCommissionField();
  updateFinalPrice();
  bookingModalOverlay.hidden = false;
}

/**
 * The commission box belongs to somebody else's car and nothing else.
 *
 * On our own cars the whole rental is ours, so there is nothing to split and
 * an empty box inviting a number would put one there -- and a commission on
 * our own car would quietly shrink the revenue this booking reports.
 */
/**
 * The rate card amount, less the discount, plus anything else.
 *
 * Shown while the form is open rather than only after saving, because a
 * discount typed into a box with no visible effect is a discount somebody
 * enters twice.
 */
function updateFinalPrice() {
  const n = (id) => Number(document.getElementById(id).value) || 0;
  const final = n('bkRentalAmount') + n('bkOtherCharges') - n('bkDiscount');
  const el = document.getElementById('bkFinalPrice');
  if (el) el.textContent = formatINR(Math.max(0, final));
}

for (const id of ['bkRentalAmount', 'bkDiscount', 'bkOtherCharges']) {
  document.getElementById(id)?.addEventListener('input', updateFinalPrice);
}

function syncCommissionField() {
  const car = loadCars().find((c) => c.id === Number(bookingVehicleSelect.value));
  const partner = Boolean(car && car.ownership === 'partner');
  const row = document.getElementById('bkCommissionRow');
  row.hidden = !partner;
  if (!partner) {
    document.getElementById('bkCommission').value = '';
    return;
  }
  document.getElementById('bkCommissionHint').textContent = car.ownerName
    ? `The rest of the rental goes to ${car.ownerName}.`
    : "The rest of the rental goes to the car's owner.";
}
bookingVehicleSelect.addEventListener('change', syncCommissionField);

function closeBookingModal() {
  bookingModalOverlay.hidden = true;
  convertingEnquiry = null;
}

hideUnless('booking.create', 'addBookingBtn');
document.getElementById('addBookingBtn').addEventListener('click', () => openBookingModal(null));
document.getElementById('bookingModalCancel').addEventListener('click', closeBookingModal);
nsModal.guard(bookingModalOverlay, closeBookingModal);

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const idValue = document.getElementById('bookingId').value;
  const [startAt, returnAt] = bookingFormDateTimes();
  const conflictEl = document.getElementById('bookingConflictError');
  conflictEl.textContent = '';

  const payload = {
    customer_name: document.getElementById('bkCustomerName').value.trim(),
    phone: document.getElementById('bkPhone').value.trim(),
    address: document.getElementById('bkAddress').value.trim(),
    licence_number: document.getElementById('bkLicence').value.trim(),
    whatsapp: document.getElementById('bkWhatsapp').value.trim(),
    licence_expiry: document.getElementById('bkLicenceExpiry').value,
    id_number: document.getElementById('bkIdNumber').value.trim(),
    customer_type: document.getElementById('bkCustomerType').value,
    estimated_km: document.getElementById('bkEstimatedKm').value,
    vehicle_id: Number(bookingVehicleSelect.value),
    start_at: startAt,
    return_at: returnAt,
    base_rental: document.getElementById('bkRentalAmount').value,
    km_limit_per_day: document.getElementById('bkKmLimit').value,
    extra_km_rate: document.getElementById('bkExtraKmRate').value,
    // Empty on our own cars, which the endpoint reads as no commission.
    commission: document.getElementById('bkCommissionRow').hidden
      ? '' : document.getElementById('bkCommission').value,
    discount: document.getElementById('bkDiscount').value || '0',
    other_charges: document.getElementById('bkOtherCharges').value || '0',
    referral_source: document.getElementById('bkReferral').value,
    balance_due_on: document.getElementById('bkBalanceDue').value,
    notes: document.getElementById('bkNotes').value.trim(),
  };
  if (idValue) payload.id = Number(idValue);

  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    if (convertingEnquiry) {
      // Goes through the enquiry endpoint so the booking keeps a link back to
      // the enquiry it came from, and the enquiry is marked Converted.
      const result = await api.enquiries.convert({
        id: convertingEnquiry.id,
        vehicle_id: payload.vehicle_id,
        start_at: payload.start_at,
        return_at: payload.return_at,
        base_rental: payload.base_rental,
        licence_number: payload.licence_number,
        address: payload.address,
      });
      convertingEnquiry = null;
      closeBookingModal();
      // Awaited, so the number is still on screen when the list behind it
      // repaints -- it is the one thing in this flow worth writing down.
      await nsDialog.tell('', {
        title: 'Booking created',
        bodyIsHtml: true,
        body: `Enquiry <strong>${escapeHTML(result.enquiry_number)}</strong> is now booking `
            + `<strong>${escapeHTML(result.booking_number)}</strong>.`,
        confirmLabel: 'Done',
      });
      // Back to the list: the enquiry that was on screen is now a booking,
      // and the page behind the form is showing what it used to be.
      closeEnquiryDetail();
      await renderInquiries();
      await renderBookingList();
      await renderOverview();
      return;
    }

    await api.bookings.save(payload);
    closeBookingModal();
    // Everything the change touches, including the record behind the form if
    // one is open.
    await refreshAfterBookingChange();
  } catch (err) {
    // A double booking is the expected failure here, so it belongs beside the
    // dates rather than in a dialog the user has to dismiss.
    if (err.status === 409) {
      conflictEl.textContent = err.message;
    } else {
      showError(err);
    }
  } finally {
    submitBtn.disabled = false;
  }
});

// ---- Booking detail ----
let currentDetailBookingId = null;
let currentDetail = null;

// A booking opens in place of the list rather than in a dialog. It carries
// payments, deposits, two odometer readings, documents and a timeline, and
// that is a page's worth of material -- in a modal it was a long scroll with
// the list stranded behind it.
let bookingDetailPane = 'overview';

async function openBookingDetail(id) {
  currentDetailBookingId = id;
  bookingDetailPane = 'overview';
  // The record lives inside the Bookings panel, so opening one from the
  // dashboard, the bell or a link has to bring that panel up first --
  // otherwise the click looks like it did nothing.
  showPanelFor('bookings');
  const view = document.getElementById('bookingDetailView');
  document.getElementById('bookingListView').hidden = true;
  view.hidden = false;
  view.innerHTML = '<p class="detail-empty">Loading…</p>';
  window.scrollTo({ top: 0, behavior: 'instant' });
  await renderBookingDetail(id);
}

function closeBookingDetail() {
  document.getElementById('bookingDetailView').hidden = true;
  document.getElementById('bookingListView').hidden = false;
  currentDetailBookingId = null;
  currentDetail = null;
}

async function refreshAfterBookingChange() {
  await renderBookingList();
  await renderOverview();
  await renderCarAdminGrid();
  if (currentDetailBookingId) await renderBookingDetail(currentDetailBookingId);
}

function timelineHTML(entries) {
  if (!entries || !entries.length) return '<p class="detail-empty">No activity yet.</p>';
  const label = (action) => action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `<ul class="timeline-list">${entries.map((t) => `
    <li>
      <span class="t-event">${label(t.action)}${t.reason ? ` — ${t.reason}` : ''}</span>
      <span class="t-time">${formatDateTime(t.created_at)}${t.user_label ? ` · ${t.user_label}` : ''}</span>
    </li>`).join('')}</ul>`;
}

/**
 * The booking confirmation a customer is given.
 *
 * Printed rather than generated as a file: the browser's own print dialogue
 * saves a PDF on every machine and phone the panel is used from, with no
 * library to ship and nothing to install on the server. What it costs is one
 * extra step -- choose "Save as PDF" -- and what it buys is a document that
 * works the first time on a phone at a handover counter.
 *
 * The filename is the thing that makes it sendable, and browsers take it
 * from document.title. So the title becomes the booking number for the
 * length of the dialogue and is put back afterwards: a customer receives
 * NSC-2026-0024.pdf rather than dashboard.pdf, and knows what it is before
 * opening it.
 *
 * Everything on it is already on the booking. Nothing is recalculated here --
 * a confirmation that disagrees with the record is worse than no
 * confirmation, so this only ever reads.
 */
function businessDetails() {
  const el = document.getElementById('businessDetails');
  try {
    return el ? JSON.parse(el.textContent) : {};
  } catch {
    return {};
  }
}

async function printConfirmation(booking) {
  const biz = businessDetails();
  const c = booking.charges || {};
  const line = (k, v) => `<div class="pc-line"><span>${k}</span><span>${v}</span></div>`;
  // A figure worth printing. Zero rows are left off: a confirmation listing
  // "Discount ₹0" invites the question of what the discount was.
  const money = (k, v, always = false) =>
    (Number(v) || always) ? line(k, formatINR(v)) : '';

  const addr = (biz.address || []).map((l) => escapeHTML(l)).join('<br>');
  const balance = Number(booking.balance) || 0;
  // Written by the owner in Website content. None written means no terms
  // section, rather than a document carrying rules nobody agreed to.
  const terms = ((biz.terms || {}).items || []).filter((t) => String(t || '').trim() !== '');
  const held = Number(booking.deposit_held) || 0;
  const cancelled = booking.status === 'Cancelled';

  const html = `
    <div class="pc-head">
      <div class="pc-ident">
        ${biz.logo ? `<img class="pc-logo" src="${escapeHTML(biz.logo)}" alt=""
             onerror="this.onerror=null;this.src='${escapeHTML(biz.logoFallback || '')}'">` : ''}
        <div>
          <h1>${escapeHTML(biz.name || 'Booking confirmation')}</h1>
          <p class="pc-contact">
            ${biz.phone ? escapeHTML(biz.phone) : ''}${biz.phone && biz.email ? ' · ' : ''}${biz.email ? escapeHTML(biz.email) : ''}
            ${addr ? `<br>${addr}` : ''}
          </p>
        </div>
      </div>
      <div class="pc-ref">
        <span class="pc-ref-k">Booking</span>
        <span class="pc-ref-v">${escapeHTML(booking.booking_number)}</span>
        ${/* The booking's status is the panel's business, not the customer's:
              on a page headed "Booking confirmation", a line reading
              "Completed" raises a question it does not answer. The one state
              that must be said out loud is cancelled -- handing over a
              confirmation for a booking that is off, without saying so, is
              the one way this document could mislead somebody. */
          cancelled ? '<span class="pc-ref-x">Cancelled</span>' : ''}
      </div>
    </div>

    <h2 class="pc-title">Booking confirmation</h2>

    <div class="pc-cols">
      <section>
        <h3>Who it is for</h3>
        ${line('Name', escapeHTML(booking.customer_name))}
        ${line('Phone', escapeHTML(booking.customer_phone))}
        ${booking.customer_address ? line('Address', escapeHTML(booking.customer_address)) : ''}
        ${booking.licence_number ? line('Licence no.', escapeHTML(booking.licence_number)) : ''}
      </section>

      <section>
        <h3>The vehicle</h3>
        ${line('Vehicle', escapeHTML(booking.vehicle_name))}
        ${booking.vehicle_reg ? line('Registration', escapeHTML(booking.vehicle_reg)) : ''}
        ${line('From', formatDateTime(booking.start_at))}
        ${line('Until', formatDateTime(booking.return_at))}
        ${line('Days', String(booking.duration_days))}
      </section>
    </div>

    <div class="pc-cols">
    <section class="pc-terms">
      <h3>What was agreed</h3>
      ${c.rate_daily ? line('Daily rate', formatINR(c.rate_daily)) : ''}
      ${c.km_limit_per_day ? line('KM included', `${c.km_limit_per_day} km a day`) : ''}
      ${c.extra_km_rate ? line('Beyond that', `${formatINR(c.extra_km_rate)} a km`) : ''}
      ${c.deposit_required ? line('Deposit', formatINR(c.deposit_required)) : ''}
    </section>

    <section class="pc-money">
      <h3>The money</h3>
      ${money('Rental', c.base_rental, true)}
      ${money('Other charges', c.other_charges)}
      ${/* Negated, because the total already has it taken off. Printed as a
            plain 500 it reads as another charge, and a customer adding the
            column up finds it does not reach the total -- which is exactly
            the sort of thing that turns a handover into an argument. */
        money('Discount', -Math.abs(Number(c.discount) || 0))}
      ${money('Extra KM', (booking.km || {}).extra_km_charge)}
      ${money('Extras', booking.extras_total)}
      <div class="pc-line pc-total"><span>Total</span><span>${formatINR(booking.total)}</span></div>
      ${money('Received', booking.paid, true)}
      <div class="pc-line pc-balance"><span>${balance > 0 ? 'Still to pay' : 'Balance'}</span><span>${formatINR(balance)}</span></div>
      ${/* The deposit was a line here and a line under "What was agreed",
            which reads as being charged for it twice. It is not part of the
            total, so it is not a row in the column that adds up to one --
            it is a note under it, which is also the thing a customer
            actually wants to know: how much of theirs is being held. */
        held > 0 ? `<p class="pc-note">${formatINR(held)} deposit held, separate from the total above and returned after the car comes back.</p>` : ''}
    </section>
    </div>

    ${terms.length ? `
      <section class="pc-rules">
        <h3>${escapeHTML((biz.terms && biz.terms.heading) || 'Terms')}</h3>
        <ol>${terms.map((t) => `<li>${escapeHTML(t)}</li>`).join('')}</ol>
      </section>` : ''}

    <p class="pc-foot">
      Please bring the licence used to book, and an ID.
      ${biz.phone ? `Any question before pickup, call ${escapeHTML(biz.phone)}.` : ''}
      <span class="pc-issued">Issued ${formatDate(new Date().toISOString())}</span>
    </p>`;

  let sheet = document.getElementById('bookingConfirmation');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'bookingConfirmation';
    document.body.appendChild(sheet);
  }
  sheet.innerHTML = html;

  // The logo is fetched the instant it is written into the page, and
  // print() is called in the same breath. A browser usually waits, but
  // "usually" is a confirmation handed over with no logo on it, which is
  // exactly the kind of fault nobody reports and everybody notices. So wait
  // for it -- briefly, and never at the cost of the document: a logo that is
  // slow or missing prints a confirmation without one rather than nothing.
  const logo = sheet.querySelector('.pc-logo');
  if (logo && !logo.complete) {
    await Promise.race([
      new Promise((done) => {
        logo.addEventListener('load', done, { once: true });
        logo.addEventListener('error', done, { once: true });
      }),
      new Promise((done) => setTimeout(done, 1500)),
    ]);
  }

  const title = document.title;
  document.title = `${booking.booking_number} — ${biz.name || 'Booking confirmation'}`;
  document.body.classList.add('is-printing-confirmation');

  // Put the page back whichever way the dialogue ends. afterprint does not
  // fire everywhere, so the timer is the one that always runs; both are
  // written to be safe twice.
  const restore = () => {
    document.body.classList.remove('is-printing-confirmation');
    document.title = title;
  };
  window.addEventListener('afterprint', restore, { once: true });
  setTimeout(restore, 1000);

  window.print();
}

async function renderBookingDetail(id) {
  const view = document.getElementById('bookingDetailView');

  let booking;
  try {
    booking = (await api.bookings.get(id)).booking;
  } catch (err) {
    view.innerHTML = '<p class="detail-empty">Could not load this booking.</p>';
    showError(err);
    return;
  }
  currentDetail = booking;

  const charges = booking.charges || {};
  const km = booking.km || {};
  const open = booking.status !== 'Completed' && booking.status !== 'Cancelled';
  // Whether something already on the booking can still be put right. A
  // closed booking takes nothing new -- that is what `open` is for -- but a
  // figure found to be wrong a week later has to be correctable, which is
  // why Void has never been gated on `open` either. A cancelled booking is
  // the exception the server also makes: its charges are settled.
  const amendable = booking.status !== 'Cancelled';

  // Payments that have been voided stay listed, struck through: the record of
  // what was entered is part of the trail, not something to hide.
  const paymentRows = booking.payments.length
    ? booking.payments.map((p) => `
        <div class="payment-row ${p.status !== 'active' ? 'payment-void' : ''}">
          <span>
            ${PAYMENT_TYPE_LABELS[p.kind] || p.kind} · ${p.method}
            ${p.reference ? `(${p.reference})` : ''} · ${formatDate(p.paid_on)}
            ${p.corrects_id ? '<em>correction</em>' : ''}
            ${p.status !== 'active' ? `<em>${p.status}</em>` : ''}
          </span>
          <span class="amount">${formatINR(p.amount)}</span>
          ${p.status === 'active' ? `
            <span class="row-acts">
              <button class="btn btn-ghost btn-sm edit-payment" data-id="${p.id}">Edit</button>
              <button class="btn btn-ghost btn-sm void-payment" data-id="${p.id}">Void</button>
            </span>` : ''}
        </div>`).join('')
    : '<p class="detail-empty">No payments recorded yet.</p>';

  // Only what still stands. A corrected deposit leaves the wrong row behind
  // on purpose; offering to correct that one again is offering to correct
  // history.
  const depositRows = (booking.deposits || []).filter((d) => d.status === 'active');
  const refundRows  = (booking.refunds || []).filter((r) => (r.status || 'active') === 'active');

  const row = (k, v) => `<div class="info-row"><span class="k">${k}</span><span class="v">${v}</span></div>`;

  // ---- Overview: who, what, and on what terms -----------------------------
  const overview = `
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('user')}</span>
          <h3>Customer</h3>
          ${open ? '<button class="btn btn-ghost btn-sm card-edit" id="edit-customer">Edit</button>' : ''}
        </div>
        ${row('Name', escapeHTML(booking.customer_name))}
        ${row('Phone', `<a href="tel:${escapeHTML(booking.customer_phone)}">${escapeHTML(booking.customer_phone)}</a>`)}
        ${row('Address', escapeHTML(booking.customer_address) || '—')}
        ${row('Licence No.', escapeHTML(booking.licence_number) || '—')}
        ${booking.referral_source
          ? row('Found us through', escapeHTML(booking.referral_source.replace(/_/g, ' ')))
          : ''}
      </div>

      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('car')}</span>
          <h3>Rental</h3>
          ${open ? '<button class="btn btn-ghost btn-sm card-edit" id="edit-rental">Edit</button>' : ''}
        </div>
        ${row('Vehicle', escapeHTML(booking.vehicle_name))}
        ${row('Reg. Number', escapeHTML(booking.vehicle_reg) || '—')}
        ${row('Start', formatDateTime(booking.start_at))}
        ${row('Return', formatDateTime(booking.return_at))}
        ${row('Duration', `${booking.duration_days} day(s)`)}
      </div>

      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('rupee')}</span>
          <h3>Agreed terms</h3>
          ${open ? '<button class="btn btn-ghost btn-sm card-edit" id="edit-terms">Edit</button>' : ''}
        </div>
        ${row('Rental amount', formatINR(charges.base_rental || 0))}
        ${row('KM limit', `${charges.km_limit_per_day || 0}/day`)}
        ${row('Extra KM rate', `₹${charges.extra_km_rate || 0}/km`)}
        ${Number(charges.discount) ? row('Discount', '- ' + formatINR(charges.discount)) : ''}
        ${Number(charges.other_charges) ? row('Other charges', '+ ' + formatINR(charges.other_charges)) : ''}
        ${booking.balance_due_on && booking.balance > 0
          ? row('Balance due by', formatDate(booking.balance_due_on)) : ''}
      </div>

      ${booking.ownership === 'partner' ? `
      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('building')}</span>
          <h3>Commission</h3>
        </div>
        ${row('Whose car', booking.owner_name ? escapeHTML(booking.owner_name) + "'s" : 'A partner’s')}
        ${row('Customer pays', formatINR(booking.total))}
        ${row('Your commission', formatINR(booking.commission))}
        ${row('Payable to owner', formatINR(booking.owner_payout))}
      </div>` : ''}

      ${booking.notes || booking.cancelled_reason ? `
      <div class="info-card">
        <div class="info-card-head">
          <span class="info-card-ico">${recIcon('book')}</span>
          <h3>Notes</h3>
        </div>
        ${booking.notes ? `<p class="field-hint">${escapeHTML(booking.notes)}</p>` : ''}
        ${booking.cancelled_reason ? `<p class="field-hint">
          Cancelled${booking.cancelled_at ? ' ' + formatDateTime(booking.cancelled_at) : ''}${
            booking.cancelled_by ? ` · ${booking.cancelled_by === 'customer' ? "the customer's decision" : 'our decision'}` : ''
          } — ${escapeHTML(booking.cancelled_reason)}</p>` : ''}
      </div>` : ''}
    </div>`;

  // ---- Payments -----------------------------------------------------------
  const payments = `
    <div class="detail-section">
      <div class="detail-section-title">
        <span>Payments</span>
        ${open ? '<button class="btn btn-outline btn-sm" id="detailAddPaymentBtn">+ Add Payment</button>' : ''}
      </div>
      ${paymentRows}

      ${(booking.extras || []).length ? `
        <p class="modal-section-label">Charges added later</p>
        ${booking.extras.map((x) => `
          <div class="payment-row">
            <span class="payment-meta">${escapeHTML(x.label)}
              ${x.note ? `<span class="payment-note">${escapeHTML(x.note)}</span>` : ''}
            </span>
            <span class="amount">+ ${formatINR(x.amount)}</span>
            ${amendable ? `
              <span class="row-acts">
                <button class="btn btn-ghost btn-sm edit-extra" data-id="${x.id}">Edit</button>
                <button class="btn btn-ghost btn-sm void-extra" data-id="${x.id}">Remove</button>
              </span>` : ''}
          </div>`).join('')}
      ` : ''}

      <div class="detail-grid" style="margin-top:12px">
        <div class="detail-field"><span class="k">Rental Amount</span><span class="v">${formatINR(charges.base_rental || 0)}</span></div>
        ${Number(booking.extra_km_charge) ? `
          <div class="detail-field"><span class="k">Extra KM (${Number(booking.extra_km || 0).toLocaleString('en-IN')} km)</span><span class="v">+ ${formatINR(booking.extra_km_charge)}</span></div>` : ''}
        ${Number(charges.other_charges) ? `
          <div class="detail-field"><span class="k">Other Charges</span><span class="v">+ ${formatINR(charges.other_charges)}</span></div>` : ''}
        ${Number(charges.discount) ? `
          <div class="detail-field"><span class="k">Discount</span><span class="v">- ${formatINR(charges.discount)}</span></div>` : ''}
        <div class="detail-field"><span class="k">Rental Amount Due</span><span class="v">${formatINR(booking.total)}</span></div>
        <div class="detail-field"><span class="k">Total Paid</span><span class="v">${formatINR(booking.paid)}</span></div>
        <div class="detail-field"><span class="k">Balance</span><span class="v">${formatBalance(booking.balance)}</span></div>
        <div class="detail-field"><span class="k">Status</span><span class="v">${booking.payment_status}</span></div>
      </div>
      ${attachmentsHTML(booking.files, 'payment', 'Payment screenshots')}
    </div>`;

  // ---- The deposit, which is never revenue --------------------------------
  const deposit = `
    <div class="detail-section">
      <div class="detail-section-title">
        <span>Security Deposit</span>
        ${open && !booking.deposit_received ? '<button class="btn btn-outline btn-sm" id="detailAddDepositBtn">+ Add Deposit</button>' : ''}
      </div>
      ${booking.deposit_received ? `
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Received</span><span class="v">${formatINR(booking.deposit_received)}</span></div>
          <div class="detail-field"><span class="k">Deducted</span><span class="v">${formatINR(booking.deposit_deducted || 0)}</span></div>
          <div class="detail-field"><span class="k">Refunded</span><span class="v">${formatINR(booking.deposit_refunded)}</span></div>
          <div class="detail-field"><span class="k">Still Held</span><span class="v">${formatINR(booking.deposit_held)}</span></div>
        </div>
        <p class="field-hint">Tracked separately — never counted as rental revenue.</p>
        ${booking.deposit_held > 0 ? '<button class="btn btn-outline btn-sm" id="detailRefundBtn">Refund Deposit</button>' : ''}
      ` : '<p class="detail-empty">No security deposit recorded yet.</p>'}

      ${depositRows.length ? `
        <p class="modal-section-label">What was taken</p>
        ${depositRows.map((d) => `
          <div class="payment-row">
            <span class="payment-meta">${formatDate(d.received_on)} · ${escapeHTML(d.method)}
              ${d.reference ? `<span class="payment-note">${escapeHTML(d.reference)}</span>` : ''}
            </span>
            <span class="amount">${formatINR(d.amount)}</span>
            <span class="row-acts">
              <button class="btn btn-ghost btn-sm edit-deposit" data-id="${d.id}">Edit</button>
            </span>
          </div>`).join('')}
      ` : ''}

      ${refundRows.length ? `
        <p class="modal-section-label">Refunds</p>
        ${refundRows.map((r) => `
          <div class="payment-row">
            <span class="payment-meta">${formatDate(r.refunded_on)} · ${escapeHTML(r.method)}${r.reason ? ` · ${escapeHTML(r.reason)}` : ''}
              ${r.deduction > 0 ? `<span class="payment-note">deduction ${formatINR(r.deduction)}</span>` : ''}
            </span>
            <span class="amount">${formatINR(r.refund_amount)}</span>
            <span class="row-acts">
              <button class="btn btn-ghost btn-sm edit-refund" data-id="${r.id}">Edit</button>
            </span>
          </div>`).join('')}
      ` : ''}
      ${attachmentsHTML(booking.files, 'deposit', 'Deposit proof')}
      ${attachmentsHTML(booking.files, 'refund', 'Refund proof')}
    </div>`;

  // ---- Handing the car over, and getting it back --------------------------
  const handover = `
    <div class="detail-section">
      <div class="detail-section-title">
        <span>Vehicle Pickup</span>
        ${open && !booking.pickup ? '<button class="btn btn-outline btn-sm" id="detailPickupBtn">Record Pickup</button>' : ''}
      </div>
      ${booking.pickup ? `
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Date &amp; Time</span><span class="v">${formatDateTime(booking.pickup.recorded_at)}</span></div>
          <div class="detail-field"><span class="k">Starting KM</span><span class="v">${Number(booking.pickup.odometer_km).toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Fuel Level</span><span class="v">${booking.pickup.fuel_level || '—'}</span></div>
          <div class="detail-field"><span class="k">Condition</span><span class="v">${booking.pickup.condition_note || '—'}</span></div>
        </div>
        ${checklistHTML(booking.pickup.checklist)}
        ${amendable ? `<button class="btn btn-ghost btn-sm edit-km" data-id="${booking.pickup.id}"
            data-leg="pickup">Edit this record</button>` : ''}
      ` : '<p class="detail-empty">Not recorded yet.</p>'}
      ${attachmentsHTML(booking.files, 'pickup', 'Pickup photos')}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>Vehicle Return</span>
        ${open && booking.pickup && !booking.return ? '<button class="btn btn-outline btn-sm" id="detailReturnBtn">Record Return</button>' : ''}
      </div>
      ${booking.return ? `
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Date &amp; Time</span><span class="v">${formatDateTime(booking.return.recorded_at)}</span></div>
          <div class="detail-field"><span class="k">Ending KM</span><span class="v">${Number(booking.return.odometer_km).toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Fuel Level</span><span class="v">${booking.return.fuel_level || '—'}</span></div>
          <div class="detail-field"><span class="k">Condition</span><span class="v">${booking.return.condition_note || '—'}</span></div>
        </div>
        <p class="modal-section-label">Extra KM</p>
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Total KM</span><span class="v">${Number(km.total_km || 0).toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Allowed KM</span><span class="v">${Number(km.allowed_km || 0).toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Extra KM</span><span class="v">${Number(km.extra_km || 0).toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Extra KM Charge</span><span class="v">${formatINR(km.extra_km_charge || 0)}</span></div>
        </div>
        ${checklistHTML(booking.return.checklist)}
        ${amendable ? `<button class="btn btn-ghost btn-sm edit-km" data-id="${booking.return.id}"
            data-leg="return">Edit this record</button>` : ''}
      ` : `<p class="detail-empty">${booking.pickup ? 'Not recorded yet.' : 'Record pickup first.'}</p>`}
      ${attachmentsHTML(booking.files, 'return', 'Return photos')}
    </div>

    ${(booking.damages || []).length ? `
    <div class="detail-section">
      <div class="detail-section-title"><span>Damage</span></div>
      ${booking.damages.map((d) => `
        <div class="payment-row">
          <span class="payment-meta">${escapeHTML(d.description)}
            <span class="payment-note">noticed at ${d.noticed_at}${d.note ? ' · ' + escapeHTML(d.note) : ''}</span>
          </span>
          <span class="amount">${formatINR(d.estimated_cost)}</span>
          ${amendable ? `
            <span class="row-acts">
              <button class="btn btn-ghost btn-sm edit-damage" data-id="${d.id}">Edit</button>
              <button class="btn btn-ghost btn-sm void-damage" data-id="${d.id}">Remove</button>
            </span>` : ''}
        </div>`).join('')}
      ${attachmentsHTML(booking.files, 'damage', 'Damage photos')}
    </div>` : ''}`;

  const documents = `
    <div class="detail-section">
      <div class="detail-section-title">
        <span>Customer Documents</span>
        <button class="btn btn-outline btn-sm" id="detailAddDocBtn">+ Add Document</button>
      </div>
      ${documentsHTML(booking.documents)}
    </div>`;

  const timeline = `
    <div class="detail-section">
      <div class="detail-section-title"><span>Booking Timeline</span></div>
      ${timelineHTML(booking.timeline)}
    </div>`;

  const initials = (booking.customer_name || '?').split(/\s+/).slice(0, 2)
    .map((w) => w[0] || '').join('').toUpperCase();

  view.innerHTML = `
    <button type="button" class="rec-back" id="bookingDetailBack">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back to all bookings
    </button>

    <div class="rec-hero">
      <div class="rec-hero-top">
        <span class="rec-avatar">${escapeHTML(initials)}</span>
        <div class="rec-hero-id">
          <h2>${escapeHTML(booking.booking_number)}
            <span class="status-badge status-badge-${booking.status}">${booking.status}</span>
            ${scheduleChipHTML(booking)}
            <!-- Whether the money is in is the other half of "how is this
                 booking doing", and it belongs beside the status rather than
                 a tab away. -->
            <span class="status-badge pay-badge pay-${booking.payment_status.replace(/\s+/g, '')}"
              >${booking.payment_status}</span></h2>
          <p class="rec-hero-sub">${escapeHTML(booking.customer_name)} ·
            ${escapeHTML(booking.vehicle_name)} ·
            ${formatDate(booking.start_at)} → ${formatDate(booking.return_at)}</p>
        </div>
        <div class="rec-hero-act">
          <button class="btn btn-ghost btn-sm" id="detailConfirmationBtn">Confirmation</button>
          ${open ? '<button class="btn btn-ghost btn-sm" id="detailEditBtn">Edit</button>' : ''}
          ${open ? '<button class="btn btn-ghost btn-sm" id="detailCancelBtn">Cancel Booking</button>' : ''}
          ${open ? '<button class="btn btn-primary btn-sm" id="detailCompleteBtn">Mark Completed</button>' : ''}
          <button class="btn btn-danger btn-sm" id="detailDeleteBtn">Delete Booking</button>
        </div>
      </div>

      <div class="rec-tiles">
        <div class="rec-tile">
          <div class="rec-tile-k">Rental due</div>
          <div class="rec-tile-v">${formatINR(booking.total)}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">Received</div>
          <div class="rec-tile-v">${formatINR(booking.paid)}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">Balance</div>
          <div class="rec-tile-v${Number(booking.balance) > 0 ? ' is-due' : ''}">${formatINR(booking.balance)}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">Deposit held</div>
          <div class="rec-tile-v">${formatINR(booking.deposit_held || 0)}</div>
        </div>
        <div class="rec-tile">
          <div class="rec-tile-k">Days</div>
          <div class="rec-tile-v">${booking.duration_days}</div>
        </div>
      </div>
    </div>

    <div class="rec-tabs" id="bookingDetailTabs" role="tablist">
      <button type="button" class="rec-tab is-on" data-pane="overview">Overview</button>
      <button type="button" class="rec-tab" data-pane="payments">Payments
        <span class="n">${booking.payments.filter((p) => p.status === 'active').length}</span></button>
      <button type="button" class="rec-tab" data-pane="deposit">Deposit</button>
      <button type="button" class="rec-tab" data-pane="handover">Pickup &amp; Return</button>
      <button type="button" class="rec-tab" data-pane="documents">Documents
        <span class="n">${(booking.documents || []).length}</span></button>
      <button type="button" class="rec-tab" data-pane="timeline">Timeline</button>
    </div>

    <div id="bookingDetailBody">
      <div class="rec-pane" data-pane="overview">${overview}</div>
      <div class="rec-pane" data-pane="payments" hidden>${payments}</div>
      <div class="rec-pane" data-pane="deposit" hidden>${deposit}</div>
      <div class="rec-pane" data-pane="handover" hidden>${handover}</div>
      <div class="rec-pane" data-pane="documents" hidden>${documents}</div>
      <div class="rec-pane" data-pane="timeline" hidden>${timeline}</div>
    </div>
  `;

  document.getElementById('bookingDetailBack').addEventListener('click', async () => {
    closeBookingDetail();
    await renderBookingList();
  });
  wireRecTabs(view, bookingDetailPane, (pane) => { bookingDetailPane = pane; });

  wireDetailActions(booking);
}

/**
 * The tabs on a record. Which one is open survives a re-render -- recording a
 * payment and being thrown back to Overview is how you lose your place.
 */
function wireRecTabs(view, current, remember) {
  const tabs = [...view.querySelectorAll('.rec-tab')];
  const panes = [...view.querySelectorAll('.rec-pane')];
  const show = (name) => {
    if (!tabs.some((t) => t.dataset.pane === name)) name = tabs[0]?.dataset.pane;
    tabs.forEach((t) => t.classList.toggle('is-on', t.dataset.pane === name));
    panes.forEach((p) => { p.hidden = p.dataset.pane !== name; });
    remember(name);
  };
  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.pane)));
  show(current);
}

function wireDetailActions(booking) {
  const on = (id, handler) => document.getElementById(id)?.addEventListener('click', handler);

  // Removing an attachment. Delegated from the panel rather than bound per
  // thumbnail, because the list is re-rendered after every change and
  // per-element listeners would be re-bound each time or left behind.
  document.querySelectorAll('.proof-remove').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!await nsDialog.confirm('It cannot be brought back.', {
        title: 'Remove this file?',
        confirmLabel: 'Remove',
        tone: 'danger',
      })) return;
      try {
        await api.bookingFiles.remove(Number(btn.dataset.fileId));
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  on('detailConfirmationBtn', () => printConfirmation(booking));

  // The form opens over the record rather than in place of it: saving
  // re-renders what is behind, so you end up back where you were.
  on('detailEditBtn', () => openBookingModal(booking));

  on('detailCancelBtn', async () => {
    const title = `Cancel ${booking.booking_number || 'this booking'}`;
    const reason = await nsDialog.ask('Why is this booking being cancelled?', {
      title,
      confirmLabel: 'Next',
      required: true,
      validate: (v) => (v.trim() ? null : 'A reason is required to cancel a booking.'),
    });
    if (reason === null) return;

    // Whose decision it was decides whether a fee is fair, and it is the one
    // thing nobody remembers a month later. Asked as two named answers: it
    // used to be a confirm, where the choice was between OK and Cancel and
    // the message had to explain which was which.
    const by = await nsDialog.choose('Who cancelled it?', [
      { value: 'customer', label: 'The customer cancelled' },
      { value: 'admin', label: 'We cancelled it' },
    ], { title, confirmLabel: 'Next' });
    if (by === null) return;

    const fee = await nsDialog.ask('Cancellation fee to keep (\u20b9)', {
      title,
      body: 'Leave it blank if there is none.',
      confirmLabel: 'Cancel the booking',
      tone: 'danger',
      type: 'number',
      placeholder: '0',
      validate: (v) => (v.trim() === '' || Number(v) >= 0 ? null : 'That is not an amount.'),
    });
    if (fee === null) return;

    try {
      const result = await api.bookings.cancel(booking.id, reason.trim(), by, fee);
      if (result.warning) nsDialog.tell(result.warning, { title: 'Cancelled, with a note' });
      await refreshAfterBookingChange();
    } catch (err) { showError(err); }
  });

  // Adding a document. A hidden input rather than a modal: one file, one
  // kind, and a dialog around that is more clicks than the job needs.
  on('detailAddDocBtn', async () => {
    if (!booking.customer_id) {
      nsDialog.tell('This booking has no customer record yet.', { title: 'Documents' });
      return;
    }
    // A list to pick from rather than a slug to type: the old prompt printed
    // the kinds and then asked the user to copy one of them back.
    const kind = await nsDialog.choose('Which document?', DOCUMENT_KINDS.map(([k, l]) => ({
      value: k, label: l,
    })), { title: 'Add a document', confirmLabel: 'Next', value: 'licence' });
    if (kind === null) return;

    const expiry = kind === 'licence'
      ? (await nsDialog.ask('Licence expiry date', {
        title: 'Add a document',
        body: 'Leave it blank if you do not have it.',
        confirmLabel: 'Choose the file',
        type: 'date',
      }))
      : '';
    if (expiry === null) return;

    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/jpeg,image/png,image/webp,image/avif,application/pdf';
    picker.addEventListener('change', async () => {
      if (!picker.files || picker.files.length === 0) return;
      try {
        await api.customerFiles.add(booking.customer_id, kind, picker.files[0], expiry.trim());
        await renderBookingDetail(booking.id);
      } catch (err) { showError(err); }
    });
    picker.click();
  });

  document.querySelectorAll('.remove-doc').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!await nsDialog.confirm('It cannot be brought back.', {
        title: 'Remove this document?',
        confirmLabel: 'Remove',
        tone: 'danger',
      })) return;
      try {
        await api.customerFiles.remove(Number(btn.dataset.id));
        await renderBookingDetail(booking.id);
      } catch (err) { showError(err); }
    });
  });

  document.querySelectorAll('.void-damage').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!await nsDialog.confirm('Any charge raised for it stays. Void that separately.', {
        title: 'Remove this damage record?',
        confirmLabel: 'Remove',
        tone: 'danger',
      })) return;
      try {
        await api.extras.voidDamage(Number(btn.dataset.id));
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  on('detailDeleteBtn', () => deleteBooking(booking));

  on('detailCompleteBtn', async () => {
    if (!await nsDialog.confirm('The vehicle is back and the rental is over.', {
      title: 'Mark this booking as completed?',
      confirmLabel: 'Mark completed',
    })) return;
    try {
      const result = await api.bookings.complete(booking.id);
      if (result.warning) nsDialog.tell(result.warning, { title: 'Completed, with a note' });
      await refreshAfterBookingChange();
    } catch (err) { showError(err); }
  });

  on('detailAddPaymentBtn', () => openPaymentModal(booking.id));
  on('detailAddDepositBtn', () => openDepositModal(booking.id, booking));
  on('detailRefundBtn',    () => openRefundModal(booking.id, booking));
  on('detailPickupBtn',    () => openPickupModal(booking.id, booking));
  on('detailReturnBtn',    () => openReturnModal(booking.id, booking));

  document.querySelectorAll('.void-payment').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const reason = await nsDialog.ask('Why is this payment being voided?', {
        title: 'Void this payment',
        body: 'The payment stays on the record and stops counting.',
        confirmLabel: 'Void it',
        tone: 'danger',
        required: true,
        validate: (v) => (v.trim() ? null : 'A reason is required to void a payment.'),
      });
      if (reason === null) return;
      try {
        await api.payments.void(Number(btn.dataset.id), reason.trim());
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  // Pickup and return: the odometer, the fuel, the condition and the time
  // the car actually changed hands, in one go. It used to be the odometer
  // alone, which meant a fuel level written down wrong at the counter could
  // not be put right at all.
  document.querySelectorAll('.edit-km').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const leg = btn.dataset.leg;
      const record = booking[leg];
      if (!record) return;

      const answer = await nsDialog.form([
        { name: 'odometer_km', label: 'Odometer (km)', type: 'number', half: true,
          value: record.odometer_km, required: true,
          hint: `Recorded as ${Number(record.odometer_km).toLocaleString('en-IN')} km`,
          validate: (v) => (Number(v) >= 0 ? null : 'A reading in kilometres.') },
        { name: 'recorded_at', label: 'Date and time', type: 'datetime-local', half: true,
          value: String(record.recorded_at || '').replace(' ', 'T').slice(0, 16) },
        // The blank is first so a reading taken without a fuel level keeps
        // saying so, rather than silently becoming Full on its way through
        // a dropdown that had no way to say "not noted".
        { name: 'fuel_level', label: 'Fuel level', type: 'select', half: true,
          value: record.fuel_level || '',
          options: [{ value: '', label: 'Not noted' }]
            .concat(FUEL_LEVELS.map((f) => ({ value: f, label: f }))) },
        { name: 'condition_note', label: 'Condition', half: true,
          value: record.condition_note || '', placeholder: 'e.g. Clean, no visible damage' },
        { name: 'reason', label: 'Why is it being changed?', required: true,
          placeholder: 'e.g. Read off the trip meter by mistake' },
      ], {
        title: leg === 'pickup' ? 'Edit the pickup record' : 'Edit the return record',
        body: 'The record you are replacing stays on the booking, marked, with '
            + 'this reason against it.',
        confirmLabel: 'Save the correction',
      });
      if (answer === null) return;

      try {
        const result = await api.km.correct({
          id: Number(btn.dataset.id),
          odometer_km: Number(answer.odometer_km),
          recorded_at: answer.recorded_at ? answer.recorded_at.replace('T', ' ') : '',
          fuel_level: answer.fuel_level,
          condition_note: answer.condition_note,
          reason: answer.reason.trim(),
        });
        nsDialog.tell(`Reading corrected by ${result.difference} km. `
          + 'The original reading is kept on the record.', { title: 'Record corrected' });
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  // ---- Correcting what is already on the record ------------------------
  //
  // Every one of these says the same thing in the same way: what it is now,
  // what it should be, and why. None of them overwrites a figure -- the
  // server keeps the wrong row, marked, and puts the right one in its place,
  // so the booking can still be read as it stood on any past day.

  const methodOptions = PAYMENT_METHODS.map((m) => ({ value: m, label: m }));

  document.querySelectorAll('.edit-payment').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const payment = (booking.payments || []).find((p) => p.id === id);
      if (!payment) return;
      const was = Number(payment.amount);

      const answer = await nsDialog.form([
        { name: 'amount', label: 'What the amount should be (₹)', type: 'number', half: true,
          value: was, required: true, hint: `Entered as ${formatINR(was)}`,
          validate: (v) => {
            if (!Number.isFinite(Number(v)) || Number(v) < 0) return 'An amount in rupees.';
            return Number(v) === was ? 'That is the figure already recorded.' : null;
          } },
        { name: 'paid_on', label: 'Date', type: 'date', half: true, value: payment.paid_on,
          required: true },
        { name: 'method', label: 'Method', type: 'select', half: true,
          value: payment.method, options: methodOptions },
        { name: 'reference', label: 'Reference', half: true, value: payment.reference || '',
          placeholder: 'UPI ref / UTR' },
        { name: 'reason', label: 'Why is it being changed?', required: true,
          placeholder: 'e.g. ₹8,000 typed for ₹3,000' },
      ], {
        title: 'Edit this payment',
        body: 'The entry stays on the booking and an adjustment is recorded against '
            + 'it, so both the figure that was taken and the fix are on the record.',
        confirmLabel: 'Save the correction',
      });
      if (answer === null) return;

      // The server takes the difference, not the new total: the correction is
      // a row of its own and the original is never touched.
      const adjustment = (Number(answer.amount) - was).toFixed(2);
      try {
        await api.payments.correct({
          corrects_id: id,
          amount: adjustment,
          paid_on: answer.paid_on,
          method: answer.method,
          reference: answer.reference,
          reason: answer.reason.trim(),
        });
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  document.querySelectorAll('.edit-deposit').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const deposit = (booking.deposits || []).find((d) => d.id === id);
      if (!deposit) return;

      const answer = await nsDialog.form([
        { name: 'amount', label: 'What was taken (₹)', type: 'number', half: true,
          value: deposit.amount, required: true,
          hint: `Entered as ${formatINR(deposit.amount)}`,
          validate: (v) => (Number(v) > 0 ? null : 'A deposit is more than nothing.') },
        { name: 'received_on', label: 'Date', type: 'date', half: true,
          value: deposit.received_on, required: true },
        { name: 'method', label: 'Method', type: 'select', half: true,
          value: deposit.method, options: methodOptions },
        { name: 'reference', label: 'Reference', half: true,
          value: deposit.reference || '', placeholder: 'UPI ref / UTR' },
        { name: 'reason', label: 'Why is it being changed?', required: true },
      ], {
        title: 'Edit this deposit',
        body: 'The figure you are replacing stays on the booking, marked, with this '
            + 'reason against it.',
        confirmLabel: 'Save the correction',
      });
      if (answer === null) return;
      try {
        await api.payments.correctDeposit({
          id,
          amount: answer.amount,
          received_on: answer.received_on,
          method: answer.method,
          reference: answer.reference,
          reason: answer.reason.trim(),
        });
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  document.querySelectorAll('.edit-refund').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const refund = (booking.refunds || []).find((r) => r.id === id);
      if (!refund) return;

      const answer = await nsDialog.form([
        { name: 'refund_amount', label: 'Given back (₹)', type: 'number', half: true,
          value: refund.refund_amount, required: true,
          hint: `Entered as ${formatINR(refund.refund_amount)}`,
          validate: (v) => (Number(v) >= 0 ? null : 'An amount in rupees.') },
        { name: 'deduction', label: 'Kept back (₹)', type: 'number', half: true,
          value: refund.deduction || 0,
          validate: (v) => (Number(v || 0) >= 0 ? null : 'An amount in rupees.') },
        { name: 'deduction_reason', label: 'Why any was kept',
          value: refund.reason || '', placeholder: 'Needed only if something is kept back' },
        { name: 'refunded_on', label: 'Date', type: 'date', half: true,
          value: refund.refunded_on, required: true },
        { name: 'method', label: 'Method', type: 'select', half: true,
          value: refund.method, options: methodOptions },
        { name: 'reason', label: 'Why is it being changed?', required: true },
      ], {
        title: 'Edit this refund',
        body: 'The refund you are replacing stays on the booking, marked, with this '
            + 'reason against it.',
        confirmLabel: 'Save the correction',
        validate: (v) => (Number(v.deduction || 0) > 0 && !String(v.deduction_reason).trim()
          ? 'Money kept back from a customer has to be explained.' : null),
      });
      if (answer === null) return;
      try {
        await api.payments.correctRefund({
          id,
          refund_amount: answer.refund_amount,
          deduction: answer.deduction || '0',
          deduction_reason: answer.deduction_reason,
          refunded_on: answer.refunded_on,
          method: answer.method,
          reference: refund.reference || '',
          reason: answer.reason.trim(),
        });
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  document.querySelectorAll('.edit-extra').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const extra = (booking.extras || []).find((x) => x.id === id);
      if (!extra) return;

      const answer = await nsDialog.form([
        { name: 'kind', label: 'What it is for', type: 'select', half: true,
          value: extra.kind, options: EXTRA_KINDS.map(([v, l]) => ({ value: v, label: l })) },
        { name: 'amount', label: 'Amount (₹)', type: 'number', half: true,
          value: extra.amount, required: true, hint: `Charged as ${formatINR(extra.amount)}`,
          validate: (v) => (Number(v) > 0 ? null : 'A charge is more than nothing.') },
        { name: 'note', label: 'Note', value: extra.note || '',
          placeholder: 'What the customer is being charged for' },
        { name: 'reason', label: 'Why is it being changed?', required: true },
      ], {
        title: 'Edit this charge',
        body: 'The charge you are replacing stays on the booking, marked, with this '
            + 'reason against it.',
        confirmLabel: 'Save the correction',
      });
      if (answer === null) return;
      try {
        await api.extras.edit({
          id,
          kind: answer.kind,
          amount: answer.amount,
          note: answer.note,
          reason: answer.reason.trim(),
        });
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  document.querySelectorAll('.void-extra').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const reason = await nsDialog.ask('Why is this charge being dropped?', {
        title: 'Remove this charge',
        body: 'It stays on the booking, struck through, and stops counting towards '
            + 'what the customer owes.',
        confirmLabel: 'Remove it',
        tone: 'danger',
        required: true,
      });
      if (!reason) return;
      try {
        await api.extras.void(Number(btn.dataset.id), reason.trim());
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  // Not money, and nothing is summed from it, so this one is changed in
  // place. What it said before is in the timeline.
  document.querySelectorAll('.edit-damage').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const damage = (booking.damages || []).find((d) => d.id === id);
      if (!damage) return;

      const answer = await nsDialog.form([
        { name: 'description', label: 'What is damaged', value: damage.description,
          required: true },
        { name: 'estimated_cost', label: 'Estimated cost (₹)', type: 'number', half: true,
          value: damage.estimated_cost,
          validate: (v) => (Number(v || 0) >= 0 ? null : 'An amount in rupees.') },
        { name: 'noticed_at', label: 'Noticed at', type: 'select', half: true,
          value: damage.noticed_at,
          options: [{ value: 'pickup', label: 'Pickup' }, { value: 'return', label: 'Return' }] },
        { name: 'note', label: 'Note', type: 'textarea', value: damage.note || '' },
      ], {
        title: 'Edit this damage record',
        body: 'An estimate, not a charge. Changing it does not change what the '
            + 'customer owes — a charge raised for it is edited on the Payments tab.',
        confirmLabel: 'Save',
      });
      if (answer === null) return;
      try {
        await api.extras.editDamage({
          id,
          description: answer.description,
          estimated_cost: answer.estimated_cost || '0',
          noticed_at: answer.noticed_at,
          note: answer.note,
        });
        await refreshAfterBookingChange();
      } catch (err) { showError(err); }
    });
  });

  document.querySelectorAll('.edit-doc').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const answer = await nsDialog.form([
        { name: 'kind', label: 'What it is', type: 'select', value: btn.dataset.kind,
          options: DOCUMENT_KINDS.map(([v, l]) => ({ value: v, label: l })) },
        { name: 'expires_on', label: 'Expires on', type: 'date', half: true,
          value: btn.dataset.expires || '' },
        { name: 'caption', label: 'Note', half: true, value: btn.dataset.caption || '' },
      ], {
        title: 'Edit this document',
        body: 'What it is and when it runs out. To put a different file in its '
            + 'place, remove this one and upload the new one.',
        confirmLabel: 'Save',
      });
      if (answer === null) return;
      try {
        await api.customerFiles.edit(Number(btn.dataset.id), answer.kind,
          answer.caption, answer.expires_on);
        await renderBookingDetail(booking.id);
      } catch (err) { showError(err); }
    });
  });

  // The three cards on Overview are all fields of the one booking form, so
  // all three open it rather than inventing three smaller ones.
  ['edit-customer', 'edit-rental', 'edit-terms']
    .forEach((id) => on(id, () => openBookingModal(booking)));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5);
}

// ---- Customer documents ----
//
// A licence is commonly a PDF, which has no thumbnail to show, so these are a
// list of rows rather than the strip of pictures the booking attachments use.
// The row says what it is, whether it has expired, and gives a link that
// opens it.
const DOCUMENT_KINDS = [
  ['licence', 'Driving licence'],
  ['id', 'Aadhaar / ID'],
  ['passport', 'Passport'],
  ['other', 'Other document'],
];

function documentsHTML(documents) {
  const held = documents || [];
  if (held.length === 0) {
    return '<p class="detail-empty">No documents on file for this customer yet.</p>';
  }

  const today = todayStr();
  return `
    <div class="doc-list">
      ${held.map((d) => {
        const expired = d.expires_on && d.expires_on < today;
        return `
        <div class="doc-row">
          <span class="doc-kind">${escapeHTML(d.label)}</span>
          <span class="doc-meta">${d.is_pdf ? 'PDF' : 'Image'}${d.caption ? ' · ' + escapeHTML(d.caption) : ''}</span>
          ${d.expires_on ? `<span class="doc-meta ${expired ? 'doc-expired' : ''}">
              ${expired ? 'Expired' : 'Expires'} ${formatDate(d.expires_on)}</span>` : ''}
          <span class="doc-actions">
            <a class="btn btn-ghost btn-sm" href="${d.url}" target="_blank" rel="noopener">Open</a>
            <button class="btn btn-ghost btn-sm edit-doc" data-id="${d.id}"
              data-kind="${escapeHTML(d.kind || 'other')}"
              data-caption="${escapeHTML(d.caption || '')}"
              data-expires="${escapeHTML(d.expires_on || '')}">Edit</button>
            <button class="btn btn-ghost btn-sm remove-doc" data-id="${d.id}">Remove</button>
          </span>
        </div>`;
      }).join('')}
    </div>`;
}

// ---- The handover checklist ----
//
// Read out of the boxes rather than kept in a variable, so what is sent is
// exactly what is on screen. Unticked is sent as false rather than omitted:
// "not checked" and "checked and wrong" are different things, and only the
// first is what a blank means here.
function readChecklist(prefix) {
  const out = {};
  for (const box of document.querySelectorAll(`#${prefix}Checklist [data-check]`)) {
    out[box.dataset.check] = box.checked;
  }
  return out;
}

function clearChecklist(prefix) {
  for (const box of document.querySelectorAll(`#${prefix}Checklist [data-check]`)) {
    box.checked = false;
  }
}

/** The checklist as it was recorded, for the booking detail. */
function checklistHTML(checklist) {
  if (!checklist || typeof checklist !== 'object') return '';
  const items = Object.entries(checklist);
  if (items.length === 0) return '';

  const label = (key) => {
    const box = document.querySelector(`[data-check="${key}"]`);
    return box ? box.parentElement.textContent.trim() : key;
  };
  const checked = items.filter(([, v]) => v);

  return `
    <p class="modal-section-label">Checked at handover (${checked.length} of ${items.length})</p>
    <div class="check-grid">
      ${items.map(([key, value]) => `
        <span class="check-item" style="cursor:default">
          <span aria-hidden="true">${value ? '\u2713' : '\u2014'}</span>
          ${escapeHTML(label(key))}
        </span>`).join('')}
    </div>`;
}

// ---- One box that finds anything ----
//
// Debounced, because a search per keystroke over four tables is four queries
// a letter. 250ms is long enough that a whole word is usually one request and
// short enough that nobody notices waiting.
const SEARCH_KINDS = { booking: 'Booking', vehicle: 'Vehicle', customer: 'Customer' };
let searchTimer = null;

function closeSearch() {
  const box = document.getElementById('searchResults');
  if (box) { box.hidden = true; box.innerHTML = ''; }
}

async function runSearch(query) {
  const box = document.getElementById('searchResults');
  if (!box) return;

  if (query.trim().length < 3) { closeSearch(); return; }

  let hits = [];
  try {
    hits = (await api.search(query)).results || [];
  } catch { closeSearch(); return; }

  box.hidden = false;
  if (hits.length === 0) {
    box.innerHTML = `<p class="search-empty">Nothing matches &ldquo;${escapeHTML(query)}&rdquo;.</p>`;
    return;
  }

  box.innerHTML = hits.map((h) => `
    <button type="button" class="search-hit" data-kind="${h.kind}" data-id="${h.id}">
      <span class="search-kind">${SEARCH_KINDS[h.kind] || h.kind}</span>
      <span class="search-title">${escapeHTML(h.title)}</span>
      <span class="search-sub">${escapeHTML(h.subtitle)}${h.note ? ' · ' + escapeHTML(h.note) : ''}</span>
    </button>`).join('');

  box.querySelectorAll('.search-hit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      closeSearch();
      document.getElementById('globalSearch').value = '';
      if (btn.dataset.kind === 'booking') {
        openBookingDetail(id);
      } else if (btn.dataset.kind === 'vehicle') {
        const car = loadCars().find((c) => c.id === id);
        if (car) openCarModal(car);
      } else {
        // A customer has no page of its own, so the useful thing is a new
        // booking with their details already looked up -- which is what
        // somebody searching a phone number is almost always about to do.
        openBookingModal(null);
        document.getElementById('bkPhone').value = btn.querySelector('.search-sub').textContent.split(' · ')[0];
        void lookupCustomer();
      }
    });
  });
}

document.getElementById('globalSearch')?.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value;
  searchTimer = setTimeout(() => void runSearch(q), 250);
});
document.getElementById('globalSearch')?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.target.value = ''; closeSearch(); }
});
// Clicking anywhere else puts the list away. Without this it sits over the
// dashboard until something else happens to close it.
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) closeSearch();
});

// ---- The six things started most often ----
//
// Each one needs the permission the screen behind it needs; a Counter Staff
// account was offered "+ Add expense" and a Finance shortcut, one of which
// opened a form the server would refuse and the other of which did nothing
// at all, because the tab it jumps to is not in that account's navigation.
const QUICK_NEEDS = {
  booking:   'booking.create',
  vehicle:   'vehicle.edit',
  expense:   'expense.create',
  inquiries: 'enquiry.view',
  bookings:  'booking.view',
  finance:   'expense.view',
};

document.querySelectorAll('[data-quick]').forEach((btn) => {
  const needs = QUICK_NEEDS[btn.dataset.quick];
  if (needs && !can(needs)) {
    btn.hidden = true;
    return;
  }
  btn.addEventListener('click', () => {
    switch (btn.dataset.quick) {
      case 'booking':   openBookingModal(null); break;
      case 'vehicle':   openCarModal(null); break;
      case 'expense':   document.getElementById('addExpenseBtn')?.click(); break;
      default:          location.hash = '#' + btn.dataset.quick;
    }
  });
});

// ---- What needs doing today ----
//
// Worked out on the server, because knowing it means looking at every
// booking's money and every vehicle's papers, and doing that in the browser
// would be one request per booking.
//
// The panel hides itself when there is nothing. An empty "Needs attention"
// heading every morning is how people stop reading the one that is not empty.
const ALERT_FLAGS = { overdue: 'Overdue', soon: 'Soon', new: 'New' };

/** The shape of the day: how many go out, how many come back, what is owed. */
function renderTodayOps(today) {
  const panel = document.getElementById('todayOps');
  if (!panel || !today) return;
  panel.hidden = false;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set('opsPickups', today.pickups);
  set('opsReturns', today.returns);
  set('opsPayments', today.payments_label ?? '₹0');
  set('opsDeposits', today.deposits_label ?? '₹0');
  set('opsServicing', today.servicing);
  set('opsEnquiries', today.enquiries);
  set('opsReminders', today.reminders ?? 0);
}

async function renderAlerts() {
  const panel = document.getElementById('alertsPanel');
  const list = document.getElementById('alertList');
  if (!panel || !list) return;

  let alerts = [];
  try {
    const answer = await api.alerts.today();
    alerts = answer.alerts || [];
    renderTodayOps(answer.today);
    // The bell in the bar shows this same list. Handing it over rather than
    // letting it fetch its own means one call to an endpoint that prices every
    // open booking, and no way for the two to disagree.
    window.nsDrawBell?.(alerts);
  } catch {
    // Silent on purpose. This is a helper beside the figures, and a red error
    // where the to-do list goes would read as something being broken. The bell
    // is told too, or it sits on "Loading…" for the rest of the session.
    panel.hidden = true;
    window.nsDrawBell?.([]);
    return;
  }

  panel.hidden = alerts.length === 0;
  list.innerHTML = alerts.map((a) => `
    <li class="alert-row is-${a.level}">
      <span class="alert-flag">${ALERT_FLAGS[a.level] || ''}</span>
      <span class="alert-subject">${escapeHTML(a.subject)}</span>
      <span class="alert-message">${escapeHTML(a.message)}</span>
      ${a.booking_id ? `<button class="btn btn-ghost btn-sm alert-go" data-booking="${a.booking_id}">Open</button>` : ''}
      ${a.vehicle_id ? `<button class="btn btn-ghost btn-sm alert-go" data-vehicle="${a.vehicle_id}">Open</button>` : ''}
    </li>`).join('');

  list.querySelectorAll('.alert-go').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.booking) {
        openBookingDetail(Number(btn.dataset.booking));
      } else if (btn.dataset.vehicle) {
        const car = loadCars().find((c) => c.id === Number(btn.dataset.vehicle));
        if (car) openCarModal(car);
      }
    });
  });
}

// ---- Who this phone number belongs to ----
//
// Asked when the number is finished rather than when the booking is saved.
// Matching on save was already happening, silently and too late: whoever was
// typing had re-keyed the address and the licence, and a different spelling
// quietly kept whichever came first.
let historyFor = '';

async function lookupCustomer() {
  const phoneField = document.getElementById('bkPhone');
  const phone = phoneField.value.replace(/\s+/g, '');
  const note = document.getElementById('customerHistory');

  if (phone === historyFor) return;
  historyFor = phone;

  if (note) note.remove();
  if (phone.length < 6) return;

  let found;
  try {
    found = await api.customers.lookup(phone);
  } catch { return; }
  if (!found.customer) return;

  // Only fills what is empty. Overwriting a name somebody has just corrected
  // would make the lookup something to fight rather than something that helps.
  const fill = (id, value) => {
    const el = document.getElementById(id);
    if (el && !el.value && value) el.value = value;
  };
  const c = found.customer;
  fill('bkCustomerName', c.name);
  fill('bkAddress', c.address);
  fill('bkLicence', c.licence_number);
  fill('bkWhatsapp', c.whatsapp);
  fill('bkLicenceExpiry', c.licence_expiry);
  fill('bkIdNumber', c.id_number);
  if (document.getElementById('bkCustomerType').value === 'New') {
    document.getElementById('bkCustomerType').value =
      c.customer_type === 'Corporate' ? 'Corporate' : 'Returning';
  }

  const panel = document.createElement('div');
  panel.className = 'history-note';
  panel.id = 'customerHistory';
  panel.innerHTML = `
    <strong>${escapeHTML(c.name)}</strong> has hired before
    ${c.documents.length ? ` · ${c.documents.length} document${c.documents.length === 1 ? '' : 's'} on file` : ' · no documents on file'}
    ${found.bookings.length ? `
      <table>
        <tr><th>Booking</th><th>Vehicle</th><th>Days</th><th>Amount</th><th>Status</th></tr>
        ${found.bookings.map((b) => `
          <tr>
            <td>${escapeHTML(b.booking_number)}</td>
            <td>${escapeHTML(b.vehicle_name)}</td>
            <td>${b.duration_days}</td>
            <td>${formatINR(b.total)}</td>
            <td>${escapeHTML(b.status)}${b.balance > 0 ? ` · ${formatINR(b.balance)} due` : ''}</td>
          </tr>`).join('')}
      </table>` : ''}`;
  phoneField.closest('.field-group').appendChild(panel);
}

document.getElementById('bkPhone')?.addEventListener('blur', lookupCustomer);

// ---- Booking attachments ----
//
// The five file boxes -- payment screenshot, deposit proof, refund proof,
// pickup photos, return photos -- have been in these forms since the booking
// screens were built and were wired to nothing at all. Choosing a file and
// pressing Save recorded the payment and threw the file away, with no error,
// which is indistinguishable from the upload having worked.
//
// Three things were missing and all three are here: a preview so you can see
// what you picked, the upload itself, and somewhere on the booking for them to
// appear afterwards.
const ATTACHMENT_BOXES = [
  { input: 'paymentProof', preview: 'paymentProofPreview', kind: 'payment' },
  { input: 'depositProof', preview: 'depositProofPreview', kind: 'deposit' },
  { input: 'refundProof', preview: 'refundProofPreview', kind: 'refund' },
  { input: 'pickupPhotos', preview: 'pickupPhotosPreview', kind: 'pickup' },
  { input: 'returnPhotos', preview: 'returnPhotosPreview', kind: 'return' },
];

// Object URLs held so they can be revoked. A page that creates one per chosen
// file and never releases them keeps every image alive in memory for as long
// as the tab is open, which on a phone is a panel that gets slower all day.
const attachmentPreviewUrls = new Map();

function clearAttachmentPreview(box) {
  const held = attachmentPreviewUrls.get(box.preview) || [];
  for (const url of held) URL.revokeObjectURL(url);
  attachmentPreviewUrls.set(box.preview, []);
  const node = document.getElementById(box.preview);
  if (node) node.innerHTML = '';
}

function resetAttachmentBox(kindOrInput) {
  const box = ATTACHMENT_BOXES.find((b) => b.kind === kindOrInput || b.input === kindOrInput);
  if (!box) return;
  clearAttachmentPreview(box);
  const input = document.getElementById(box.input);
  if (input) input.value = '';
}

for (const box of ATTACHMENT_BOXES) {
  const input = document.getElementById(box.input);
  const preview = document.getElementById(box.preview);
  if (!input || !preview) continue;

  input.addEventListener('change', () => {
    clearAttachmentPreview(box);
    const urls = [];
    for (const file of input.files) {
      const url = URL.createObjectURL(file);
      urls.push(url);
      const img = document.createElement('img');
      img.src = url;
      img.alt = file.name;
      img.title = file.name;
      preview.appendChild(img);
    }
    attachmentPreviewUrls.set(box.preview, urls);
  });
}

/**
 * Sends whatever is in one of those boxes, once the record it belongs to
 * exists.
 *
 * Deliberately after the save rather than with it: a booking_files row points
 * at a booking, and the payment or reading has to be there first. It also
 * means a refused image never costs someone the payment they just entered --
 * the record is already in, and this reports the file problem on its own.
 */
async function uploadAttachments(kind, bookingId, refId = null) {
  const box = ATTACHMENT_BOXES.find((b) => b.kind === kind);
  const input = box ? document.getElementById(box.input) : null;
  if (!input || !input.files || input.files.length === 0) return;

  try {
    const result = await api.bookingFiles.add(bookingId, kind, input.files, refId);
    if (result.warning) nsDialog.tell(result.warning, { title: 'Saved, with a note' });
  } catch (err) {
    // Said out loud, and said as being about the file only. The thing the
    // person came to do has already been saved.
    nsDialog.tell(`The ${box.kind} record was saved, but the file was not: ${err.message}`,
                  { title: 'The file did not upload' });
  } finally {
    resetAttachmentBox(kind);
  }
}

/** The thumbnails for one kind, inside the booking detail screen. */
function attachmentsHTML(files, kind, label) {
  const list = (files && files[kind]) || [];
  if (list.length === 0) return '';

  return `
    <p class="modal-section-label">${label}</p>
    <div class="proof-preview">
      ${list.map((f) => `
        <span class="proof-item">
          <a href="${f.url}" target="_blank" rel="noopener">
            <img src="${f.url}" alt="${escapeHTML(f.caption || label)}" title="${escapeHTML(f.caption || label)}">
          </a>
          <button type="button" class="proof-remove" data-file-id="${f.id}"
                  aria-label="Remove this file" title="Remove">&times;</button>
        </span>
      `).join('')}
    </div>
  `;
}

// ---- Payment modal ----
const paymentModalOverlay = document.getElementById('paymentModalOverlay');

function openPaymentModal(bookingId) {
  resetAttachmentBox('payment');
  document.getElementById('paymentForm').reset();
  document.getElementById('paymentBookingId').value = bookingId;
  document.getElementById('paymentDate').value = todayStr();
  paymentModalOverlay.hidden = false;
}
document.getElementById('paymentModalCancel').addEventListener('click', () => { paymentModalOverlay.hidden = true; });
nsModal.guard(paymentModalOverlay, () => { paymentModalOverlay.hidden = true; });

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    const bookingId = Number(document.getElementById('paymentBookingId').value);
    const saved = await api.payments.add({
      booking_id: bookingId,
      kind: document.getElementById('paymentType').value,
      amount: document.getElementById('paymentAmount').value,
      paid_on: document.getElementById('paymentDate').value,
      method: document.getElementById('paymentMethod').value,
      reference: document.getElementById('paymentReference').value.trim(),
      notes: document.getElementById('paymentNotes').value.trim(),
    });
    // Tied to the payment it proves rather than to the booking in general, so
    // a booking with four payments does not end up with four screenshots in a
    // heap nobody can match up.
    await uploadAttachments('payment', bookingId, saved.payment_id ?? null);
    paymentModalOverlay.hidden = true;
    await refreshAfterBookingChange();
  } catch (err) { showError(err); } finally { btn.disabled = false; }
});

// ---- Security deposit modal ----
const depositModalOverlay = document.getElementById('depositModalOverlay');

function openDepositModal(bookingId, booking) {
  resetAttachmentBox('deposit');
  document.getElementById('depositForm').reset();
  document.getElementById('depositBookingId').value = bookingId;
  document.getElementById('depositDate').value = todayStr();
  // Pre-fill with the deposit this booking agreed, not today's rate card.
  if (booking && booking.charges) {
    document.getElementById('depositAmount').value = booking.charges.deposit_required || '';
  }
  depositModalOverlay.hidden = false;
}
document.getElementById('depositModalCancel').addEventListener('click', () => { depositModalOverlay.hidden = true; });
nsModal.guard(depositModalOverlay, () => { depositModalOverlay.hidden = true; });

document.getElementById('depositForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await api.payments.deposit({
      booking_id: Number(document.getElementById('depositBookingId').value),
      amount: document.getElementById('depositAmount').value,
      received_on: document.getElementById('depositDate').value,
      method: document.getElementById('depositMethod').value,
      reference: document.getElementById('depositReference').value.trim(),
      notes: document.getElementById('depositNotes').value.trim(),
    });
    await uploadAttachments('deposit', Number(document.getElementById('depositBookingId').value));
    depositModalOverlay.hidden = true;
    await refreshAfterBookingChange();
  } catch (err) { showError(err); } finally { btn.disabled = false; }
});

// ---- Deposit refund modal ----
const refundModalOverlay = document.getElementById('refundModalOverlay');
let refundHeldAmount = 0;

function updateRefundPreview() {
  const deduction = Number(document.getElementById('refundDeduction').value) || 0;
  document.getElementById('refundAmountPreview').textContent =
    formatINR(Math.max(0, refundHeldAmount - deduction));
}

function openRefundModal(bookingId, booking) {
  resetAttachmentBox('refund');
  document.getElementById('refundForm').reset();
  document.getElementById('refundBookingId').value = bookingId;
  document.getElementById('refundDate').value = todayStr();
  document.getElementById('refundDeduction').value = 0;
  refundHeldAmount = booking ? Number(booking.deposit_held) : 0;
  document.getElementById('refundOriginalDeposit').textContent = formatINR(refundHeldAmount);
  updateRefundPreview();
  refundModalOverlay.hidden = false;
}
document.getElementById('refundModalCancel').addEventListener('click', () => { refundModalOverlay.hidden = true; });
nsModal.guard(refundModalOverlay, () => { refundModalOverlay.hidden = true; });
document.getElementById('refundDeduction').addEventListener('input', updateRefundPreview);

document.getElementById('refundForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    const result = await api.payments.refund({
      booking_id: Number(document.getElementById('refundBookingId').value),
      deduction: document.getElementById('refundDeduction').value || '0',
      deduction_reason: document.getElementById('refundReason').value.trim(),
      refunded_on: document.getElementById('refundDate').value,
      method: document.getElementById('refundMethod').value,
      reference: document.getElementById('refundReference').value.trim(),
      notes: document.getElementById('refundNotes').value.trim(),
    });
    await uploadAttachments('refund', Number(document.getElementById('refundBookingId').value));
    refundModalOverlay.hidden = true;
    nsDialog.tell(`Refunded ${formatINR(result.refund_amount)}.`, { title: 'Refund recorded' });
    await refreshAfterBookingChange();
  } catch (err) { showError(err); } finally { btn.disabled = false; }
});

// ---- Vehicle service ----
const serviceModalOverlay = document.getElementById('serviceModalOverlay');

async function openServiceModal(car) {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceVehicleId').value = car.id;
  document.getElementById('serviceModalTitle').textContent = `Service — ${car.name}`;
  document.getElementById('serviceDate').value = todayStr();
  // Prefilled from what the car has actually done, because that is the number
  // being recorded and retyping it is where a digit goes missing.
  document.getElementById('serviceOdometer').value = car.currentKm || '';
  document.getElementById('serviceHistory').innerHTML = '';
  serviceModalOverlay.hidden = false;

  try {
    const { services } = await api.services.list(car.id);
    document.getElementById('serviceHistory').innerHTML = services.length === 0
      ? '<p class="detail-empty">No services recorded for this car yet.</p>'
      : `<p class="modal-section-label">Previous services</p>
         <div class="doc-list">
           ${services.map((v) => `
             <div class="doc-row">
               <span class="doc-kind">${escapeHTML(v.service_type)}</span>
               <span class="doc-meta">${formatDate(v.serviced_on)}
                 · ${Number(v.odometer_km).toLocaleString('en-IN')} km
                 ${v.garage ? '· ' + escapeHTML(v.garage) : ''}</span>
               <span class="doc-actions">
                 <span class="doc-meta">${formatINR(v.amount)}</span>
                 <button class="btn btn-ghost btn-sm void-service" data-id="${v.id}">Remove</button>
               </span>
             </div>`).join('')}
         </div>`;

    document.querySelectorAll('.void-service').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!await nsDialog.confirm('It goes from this vehicle\u2019s service history.', {
          title: 'Remove this service record?',
          confirmLabel: 'Remove',
          tone: 'danger',
        })) return;
        try {
          await api.services.void(Number(btn.dataset.id));
          await openServiceModal(car);
        } catch (err) { showError(err); }
      });
    });
  } catch (err) { showError(err); }
}

document.getElementById('serviceModalCancel').addEventListener('click', () => { serviceModalOverlay.hidden = true; });
nsModal.guard(serviceModalOverlay, () => { serviceModalOverlay.hidden = true; });

document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await api.services.add({
      vehicle_id: Number(document.getElementById('serviceVehicleId').value),
      serviced_on: document.getElementById('serviceDate').value,
      odometer_km: document.getElementById('serviceOdometer').value || '0',
      service_type: document.getElementById('serviceType').value.trim(),
      amount: document.getElementById('serviceAmount').value || '0',
      garage: document.getElementById('serviceGarage').value.trim(),
      next_service_km: document.getElementById('serviceNextKm').value || '',
      next_service_on: document.getElementById('serviceNextOn').value,
      note: document.getElementById('serviceNote').value.trim(),
    });
    serviceModalOverlay.hidden = true;
    await refreshVehicles();
    renderCarAdminGrid();
    await renderAlerts();
  } catch (err) { showError(err); } finally { btn.disabled = false; }
});

// ---- Pickup modal ----
const pickupModalOverlay = document.getElementById('pickupModalOverlay');

function openPickupModal(bookingId, booking) {
  resetAttachmentBox('pickup');
  clearChecklist('pickup');
  document.getElementById('pickupForm').reset();
  document.getElementById('pickupBookingId').value = bookingId;
  document.getElementById('pickupDateField').value = todayStr();
  document.getElementById('pickupTimeField').value = nowTimeStr();
  const car = booking ? loadCars().find((c) => c.id === booking.vehicle_id) : null;
  if (car) document.getElementById('pickupStartKm').value = car.currentKm;
  pickupModalOverlay.hidden = false;
}
document.getElementById('pickupModalCancel').addEventListener('click', () => { pickupModalOverlay.hidden = true; });
nsModal.guard(pickupModalOverlay, () => { pickupModalOverlay.hidden = true; });

document.getElementById('pickupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await api.km.pickup({
      booking_id: Number(document.getElementById('pickupBookingId').value),
      odometer_km: document.getElementById('pickupStartKm').value,
      recorded_at: `${document.getElementById('pickupDateField').value} ${document.getElementById('pickupTimeField').value}`,
      fuel_level: document.getElementById('pickupFuelLevel').value,
      condition_note: document.getElementById('pickupCondition').value.trim(),
      notes: document.getElementById('pickupNotes').value.trim(),
      checklist: readChecklist('pickup'),
    });
    await uploadAttachments('pickup', Number(document.getElementById('pickupBookingId').value));
    pickupModalOverlay.hidden = true;
    await refreshAfterBookingChange();
  } catch (err) { showError(err); } finally { btn.disabled = false; }
});

// ---- Return modal ----
const returnModalOverlay = document.getElementById('returnModalOverlay');
let returnPickupKm = 0;
let returnKmLimit = 0;
let returnExtraRate = 0;
let returnDays = 1;

function updateReturnKmPreview() {
  const endKm = Number(document.getElementById('returnEndKm').value) || 0;
  const totalKm = Math.max(0, endKm - returnPickupKm);
  const allowed = returnKmLimit * returnDays;
  const extra = Math.max(0, totalKm - allowed);
  document.getElementById('returnKmPreview').textContent =
    `Total KM: ${totalKm.toLocaleString('en-IN')} · Allowed: ${allowed.toLocaleString('en-IN')} · `
    + `Extra: ${extra.toLocaleString('en-IN')} km (${formatINR(extra * returnExtraRate)})`;
}

function openReturnModal(bookingId, booking) {
  resetAttachmentBox('return');
  clearChecklist('return');
  document.getElementById('returnForm').reset();
  document.getElementById('returnBookingId').value = bookingId;
  document.getElementById('returnDateField').value = todayStr();
  document.getElementById('returnTimeField').value = nowTimeStr();
  document.getElementById('returnKmPreview').textContent = '';
  returnPickupKm = booking && booking.pickup ? Number(booking.pickup.odometer_km) : 0;
  returnKmLimit = booking && booking.charges ? Number(booking.charges.km_limit_per_day) : 0;
  returnExtraRate = booking && booking.charges ? Number(booking.charges.extra_km_rate) : 0;
  returnDays = booking ? Number(booking.duration_days) : 1;
  returnModalOverlay.hidden = false;
}
document.getElementById('returnModalCancel').addEventListener('click', () => { returnModalOverlay.hidden = true; });
nsModal.guard(returnModalOverlay, () => { returnModalOverlay.hidden = true; });
document.getElementById('returnEndKm').addEventListener('input', updateReturnKmPreview);

document.getElementById('returnForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await api.km.return({
      booking_id: Number(document.getElementById('returnBookingId').value),
      odometer_km: document.getElementById('returnEndKm').value,
      recorded_at: `${document.getElementById('returnDateField').value} ${document.getElementById('returnTimeField').value}`,
      fuel_level: document.getElementById('returnFuelLevel').value,
      condition_note: document.getElementById('returnCondition').value.trim(),
      notes: document.getElementById('returnNotes').value.trim(),
      checklist: readChecklist('return'),
    });

    // After the reading, not with it: the charges hang off a booking that has
    // been returned, and a refused charge must not cost someone the reading
    // they just took.
    await raiseReturnCharges(Number(document.getElementById('returnBookingId').value));
    await uploadAttachments('return', Number(document.getElementById('returnBookingId').value));
    returnModalOverlay.hidden = true;
    await refreshAfterBookingChange();
  } catch (err) { showError(err); } finally { btn.disabled = false; }
});

/**
 * Turns the boxes on the return form into charges and a damage record.
 *
 * Each on its own line rather than one lump, because a customer does not
 * accept "other charges" and nobody can explain one a month later.
 *
 * Every failure is reported and none of them stops the rest: a rejected
 * cleaning charge should not take the fuel charge down with it, and the return
 * itself is already saved by the time this runs.
 */
async function raiseReturnCharges(bookingId) {
  const lines = [
    ['cleaning', 'returnCleaning', 'Cleaning on return'],
    ['fuel', 'returnFuel', 'Fuel on return'],
    ['late', 'returnLate', 'Late return'],
    ['other', 'returnOther', document.getElementById('returnOtherNote').value.trim()],
  ];

  const problems = [];

  for (const [kind, field, note] of lines) {
    const amount = Number(document.getElementById(field).value) || 0;
    if (amount <= 0) continue;
    if (kind === 'other' && note === '') {
      problems.push('The other charge needs a line saying what it is for, so it was not added.');
      continue;
    }
    try {
      await api.extras.add({ booking_id: bookingId, kind, amount, note });
    } catch (err) { problems.push(`${kind}: ${err.message}`); }
  }

  const damage = document.getElementById('returnDamage').value.trim();
  if (damage !== '') {
    try {
      await api.extras.addDamage({
        booking_id: bookingId,
        description: damage,
        estimated_cost: document.getElementById('returnDamageCost').value || '0',
        noticed_at: 'return',
        // Recording damage and billing for it are separate decisions. Some
        // comes off the deposit, some is absorbed, and assuming the first
        // would make the other two wrong.
        charge_customer: document.getElementById('returnDamageCharge').checked,
      });
    } catch (err) { problems.push(`damage: ${err.message}`); }
  }

  if (problems.length) {
    nsDialog.tell('These did not go through:\n\n' + problems.join('\n'),
                  { title: 'The return was saved' });
  }
}

// ---- Dashboard: Rental Overview (point 9) ----
function renderRentalOverview() {
  const grid = document.getElementById('rentalStatGrid');
  if (!grid) return;

  const bookings = loadBookings().filter((b) => b.status !== 'Cancelled');
  const today = todayStr();

  const todaysBookings = bookings.filter((b) => b.start_at === today).length;
  const activeRentals = bookings.filter((b) => b.status === 'Active').length;
  const upcomingBookings = bookings.filter((b) => b.status === 'Confirmed' && b.start_at >= today).length;

  // Rental Revenue and Extra KM Revenue are kept separate, and until now they
  // were not: b.total already includes the extra-KM charge, and Net Revenue
  // then added extraKmRevenue on top of it. Every booking that ran over its
  // allowance was counted twice for the overage.
  //
  // Two things changed here. The extra KM comes out of the rental figure so
  // the two cards add up rather than overlap. And the sum works from what the
  // business earns rather than what the customer pays: on somebody else's car
  // most of the rental is the owner's, and only the commission is ours.
  const earnedOf = (b) => (typeof b.earned === 'number' ? b.earned : b.total);
  const commissionOf = (b) => (b.ownership === 'partner' ? (b.commission || 0) : 0);
  const extraKmOf = (b) => (b.ownership === 'partner' ? 0 : (b.extra_km_charge || 0));

  const commissionEarned = bookings.reduce((sum, b) => sum + commissionOf(b), 0);
  const ownerPayable = bookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);
  const rentalRevenue = bookings.reduce((sum, b) => sum + earnedOf(b) - extraKmOf(b), 0);
  const advanceReceived = bookings.reduce((sum, b) => sum + (b.paid || 0), 0);
  const pendingBalance = bookings.reduce((sum, b) => sum + Math.max(0, b.balance), 0);
  const depositHeld = bookings.reduce((sum, b) => sum + (b.deposit_held || 0), 0);
  const depositRefunded = bookings.reduce((sum, b) => sum + (b.deposit_refunded || 0), 0);
  const returnedBookings = bookings.filter((b) => b.total_km > 0);
  const extraKmRevenue = returnedBookings.reduce((sum, b) => sum + extraKmOf(b), 0);
  const totalKm = returnedBookings.reduce((sum, b) => sum + b.total_km, 0);
  const totalExpenses = Number(FINANCE_SUMMARY?.expenses.total) || 0;
  const netRevenue = rentalRevenue + extraKmRevenue - totalExpenses;

  document.getElementById('statTodayBookings').textContent = todaysBookings;
  document.getElementById('statActiveRentals').textContent = activeRentals;
  document.getElementById('statUpcomingBookings').textContent = upcomingBookings;
  document.getElementById('statRentalRevenue').textContent = formatINR(rentalRevenue);
  document.getElementById('statAdvanceReceived').textContent = formatINR(advanceReceived);
  document.getElementById('statPendingBalance').textContent = formatINR(pendingBalance);
  document.getElementById('statCommission').textContent = formatINR(commissionEarned);
  document.getElementById('statOwnerPayable').textContent = formatINR(ownerPayable);
  document.getElementById('statDepositHeld').textContent = formatINR(depositHeld);
  document.getElementById('statDepositRefunded').textContent = formatINR(depositRefunded);
  document.getElementById('statExtraKmRevenue').textContent = formatINR(extraKmRevenue);
  document.getElementById('statTotalKm').textContent = totalKm.toLocaleString('en-IN');
  document.getElementById('statTotalExpenses').textContent = formatINR(totalExpenses);
  document.getElementById('statNetRevenue').textContent = formatINR(netRevenue);

  // Both of these are worked out from the month's expenses, which an account
  // without the permission never fetched -- so they would read ₹0 spent and
  // a net revenue equal to the gross. Two wrong figures rather than none.
  hideUnless('report.view', 'statTotalExpenses', 'statNetRevenue');

  const activeUpcoming = bookings
    .filter((b) => b.status === 'Active' || (b.status === 'Confirmed' && b.start_at >= today))
    .sort((a, b) => a.start_at.localeCompare(b.start_at))
    .slice(0, 8);

  const wrap = document.getElementById('activeUpcomingBookings');
  wrap.innerHTML = activeUpcoming.length
    ? activeUpcoming.map((b) => `
      <div class="booking-card" data-id="${b.id}">
        <div class="booking-card-main">
          <span class="booking-card-number">${b.booking_number}</span>
          <span class="booking-card-customer">${b.customer_name}</span>
          <span class="booking-card-meta">${vehicleLabel(b.vehicle_id)} · ${formatDate(b.start_at)} → ${formatDate(b.return_at)}</span>
        </div>
        <span class="status-stack">
          <span class="status-badge status-badge-${b.status}">${b.status}</span>
          ${scheduleChipHTML(b)}
        </span>
      </div>`).join('')
    : '<div class="empty-state">No active or upcoming rentals.</div>';
  wrap.querySelectorAll('.booking-card').forEach((card) => {
    card.addEventListener('click', () => openBookingDetail(Number(card.dataset.id)));
  });
}

// ==========================================================================
// Reports
// ==========================================================================

let currentReportType = 'booking';
let currentReportData = { title: 'Booking Report', headers: [], rows: [] };

function firstDayOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

document.querySelectorAll('.report-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.report-tab').forEach((t) => t.classList.remove('is-on'));
    tab.classList.add('is-on');
    currentReportType = tab.dataset.report;
    renderReportFilters();
    renderReport();
  });
});

function vehicleOptionsHTML(includeAll) {
  const cars = loadCars();
  const all = includeAll ? '<option value="">All Vehicles</option>' : '';
  return all + cars.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderReportFilters() {
  const el = document.getElementById('reportFilters');
  if (currentReportType === 'booking') {
    el.innerHTML = `
      <div class="field-group"><label for="rfFrom">From</label><input type="date" id="rfFrom" value="${firstDayOfMonthStr()}" /></div>
      <div class="field-group"><label for="rfTo">To</label><input type="date" id="rfTo" value="${todayStr()}" /></div>
      <div class="field-group"><label for="rfVehicle">Vehicle</label><select id="rfVehicle">${vehicleOptionsHTML(true)}</select></div>
      <div class="field-group"><label for="rfStatus">Status</label>
        <select id="rfStatus"><option value="">All Statuses</option>${BOOKING_STATUSES.map((s) => `<option>${s}</option>`).join('')}</select>
      </div>`;
  } else if (currentReportType === 'revenue') {
    el.innerHTML = `
      <div class="field-group"><label for="rfFrom">From</label><input type="date" id="rfFrom" value="${firstDayOfMonthStr()}" /></div>
      <div class="field-group"><label for="rfTo">To</label><input type="date" id="rfTo" value="${todayStr()}" /></div>`;
  } else if (currentReportType === 'vehicle') {
    el.innerHTML = `
      <div class="field-group"><label for="rfMonth">Month</label><input type="month" id="rfMonth" value="${currentMonthStr()}" /></div>
      <div class="field-group"><label for="rfVehicle">Vehicle</label><select id="rfVehicle">${vehicleOptionsHTML(false)}</select></div>`;
  } else if (currentReportType === 'km') {
    el.innerHTML = `
      <div class="field-group"><label for="rfFrom">From</label><input type="date" id="rfFrom" value="${firstDayOfMonthStr()}" /></div>
      <div class="field-group"><label for="rfTo">To</label><input type="date" id="rfTo" value="${todayStr()}" /></div>
      <div class="field-group"><label for="rfVehicle">Vehicle</label><select id="rfVehicle">${vehicleOptionsHTML(true)}</select></div>`;
  } else if (currentReportType === 'deposit') {
    el.innerHTML = `
      <div class="field-group"><label for="rfFrom">From</label><input type="date" id="rfFrom" value="${firstDayOfMonthStr()}" /></div>
      <div class="field-group"><label for="rfTo">To</label><input type="date" id="rfTo" value="${todayStr()}" /></div>`;
  } else if (currentReportType === 'payment') {
    el.innerHTML = `
      <div class="field-group"><label for="rfFrom">From</label><input type="date" id="rfFrom" value="${firstDayOfMonthStr()}" /></div>
      <div class="field-group"><label for="rfTo">To</label><input type="date" id="rfTo" value="${todayStr()}" /></div>
      <div class="field-group"><label for="rfType">Payment Type</label>
        <select id="rfType"><option value="">All Types</option>${PAYMENT_TYPES.map((t) => `<option value="${t}">${PAYMENT_TYPE_LABELS[t]}</option>`).join('')}</select>
      </div>`;
  }
  el.querySelectorAll('input, select').forEach((input) => input.addEventListener('change', renderReport));
}

function computeBookingReport() {
  const from = document.getElementById('rfFrom')?.value || '';
  const to = document.getElementById('rfTo')?.value || '';
  const vehicleId = document.getElementById('rfVehicle')?.value || '';
  const status = document.getElementById('rfStatus')?.value || '';

  const rows = loadBookings()
    .filter((b) => (!from || b.start_at >= from) && (!to || b.start_at <= to))
    .filter((b) => !vehicleId || b.vehicle_id === Number(vehicleId))
    .filter((b) => !status || b.status === status)
    .map((b) => [
      b.booking_number, b.customer_name, vehicleLabel(b.vehicle_id), formatDate(b.start_at),
      formatDate(b.return_at), b.duration_days, b.status, b.total, b.balance,
    ]);

  return {
    title: 'Booking Report',
    headers: ['Booking #', 'Customer', 'Vehicle', 'Start', 'Return', 'Days', 'Status', 'Rental Amount (₹)', 'Balance (₹)'],
    rows,
  };
}

function computeRevenueReport() {
  const from = document.getElementById('rfFrom')?.value || '';
  const to = document.getElementById('rfTo')?.value || '';

  const bookings = loadBookings().filter((b) => b.status !== 'Cancelled' && (!from || b.start_at >= from) && (!to || b.start_at <= to));
  // Same two corrections as the dashboard: the extra KM is already inside
  // b.total, and a brokered hire earns the commission rather than the rental.
  const earnedOf = (b) => (typeof b.earned === 'number' ? b.earned : b.total);
  const extraKmOf = (b) => (b.ownership === 'partner' ? 0 : (b.extra_km_charge || 0));

  const rentalRevenue = bookings.reduce((sum, b) => sum + earnedOf(b) - extraKmOf(b), 0);
  const extraKmRevenue = bookings.filter((b) => b.total_km > 0).reduce((sum, b) => sum + extraKmOf(b), 0);
  const commissionEarned = bookings.reduce(
    (sum, b) => sum + (b.ownership === 'partner' ? (b.commission || 0) : 0), 0);
  const ownerPayable = bookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);
  const expenses = Number(REPORT_SUMMARY?.expenses.total) || 0;
  const netRevenue = rentalRevenue + extraKmRevenue - expenses;

  return {
    title: 'Revenue Report',
    headers: ['Metric', 'Amount (₹)'],
    rows: [
      ['Rental Revenue', rentalRevenue],
      ['Extra KM Revenue', extraKmRevenue],
      ['of which commission on other owners\u2019 cars', commissionEarned],
      ['Payable to car owners', ownerPayable],
      ['Expenses', expenses],
      ['Net Revenue', netRevenue],
    ],
  };
}

function computeVehicleReport() {
  const month = document.getElementById('rfMonth')?.value || currentMonthStr();
  const vehicleId = Number(document.getElementById('rfVehicle')?.value);
  if (!vehicleId) return { title: 'Vehicle Report', headers: ['Metric', 'Value'], rows: [] };

  const bookings = loadBookings().filter((b) => b.vehicle_id === vehicleId && b.start_at.startsWith(month));
  const nonCancelled = bookings.filter((b) => b.status !== 'Cancelled');
  const completed = bookings.filter((b) => b.status === 'Completed');
  const returned = nonCancelled.filter((b) => b.total_km > 0);

  const totalDays = nonCancelled.reduce((sum, b) => sum + b.duration_days, 0);
  const rentalRevenue = nonCancelled.reduce((sum, b) => sum + b.total, 0);
  const advanceReceived = nonCancelled.reduce((sum, b) => sum + (b.paid || 0), 0);
  const balanceReceived = 0;
  const totalKm = returned.reduce((sum, b) => sum + b.total_km, 0);
  const allowedKm = returned.reduce((sum, b) => sum + b.allowed_km, 0);
  const extraKm = returned.reduce((sum, b) => sum + b.extra_km, 0);
  const extraKmRevenue = returned.reduce((sum, b) => sum + b.extra_km_charge, 0);
  const depositsReceived = nonCancelled.reduce((sum, b) => sum + (b.deposit_received || 0), 0);
  const depositsRefunded = nonCancelled.reduce((sum, b) => sum + (b.deposit_refunded || 0), 0);
  const expenses = Number(
    (REPORT_SUMMARY?.expenses.by_vehicle || []).find((v) => v.vehicle_id === vehicleId)?.total
  ) || 0;
  const netRevenue = rentalRevenue + extraKmRevenue - expenses;

  return {
    title: `Vehicle Report — ${vehicleLabel(vehicleId)} — ${month}`,
    headers: ['Metric', 'Value'],
    rows: [
      ['Total Bookings', nonCancelled.length],
      ['Completed Bookings', completed.length],
      ['Total Rental Days', totalDays],
      ['Rental Revenue (₹)', rentalRevenue],
      ['Advance Received (₹)', advanceReceived],
      ['Balance Received (₹)', balanceReceived],
      ['Total KM', totalKm],
      ['Allowed KM', allowedKm],
      ['Extra KM', extraKm],
      ['Extra KM Revenue (₹)', extraKmRevenue],
      ['Security Deposits Received (₹)', depositsReceived],
      ['Security Deposits Refunded (₹)', depositsRefunded],
      ['Expenses (₹)', expenses],
      ['Net Revenue (₹)', netRevenue],
    ],
  };
}

function computeKmReport() {
  const from = document.getElementById('rfFrom')?.value || '';
  const to = document.getElementById('rfTo')?.value || '';
  const vehicleId = document.getElementById('rfVehicle')?.value || '';

  const rows = loadBookings()
    .filter((b) => b.total_km > 0)
    .filter((b) => (!from || b.return.date >= from) && (!to || b.return.date <= to))
    .filter((b) => !vehicleId || b.vehicle_id === Number(vehicleId))
    .map((b) => {
      const { totalKm, allowedKm, extraKm, extraKmCharge } = computeExtraKmForBooking(b);
      return [b.booking_number, vehicleLabel(b.vehicle_id), formatDate(b.return.date), totalKm, allowedKm, extraKm, extraKmCharge];
    });

  return {
    title: 'KM Report',
    headers: ['Booking #', 'Vehicle', 'Return Date', 'Total KM', 'Allowed KM', 'Extra KM', 'Extra KM Charge (₹)'],
    rows,
  };
}

function computeDepositReport() {
  const from = document.getElementById('rfFrom')?.value || '';
  const to = document.getElementById('rfTo')?.value || '';

  const bookings = loadBookings().filter((b) => b.status !== 'Cancelled' && (!from || b.start_at >= from) && (!to || b.start_at <= to));
  const received = bookings.reduce((sum, b) => sum + (b.securityDeposit ? b.securityDeposit.amount : 0), 0);
  const refunded = bookings.reduce((sum, b) => sum + (b.deposit_refunded || 0), 0);
  const held = bookings.reduce((sum, b) => sum + (b.deposit_held || 0), 0);
  const pending = bookings
    .filter((b) => !b.securityDeposit && (b.status === 'Confirmed' || b.status === 'Active'))
    .reduce((sum, b) => sum + (loadCars().find((c) => c.id === b.vehicle_id)?.securityDeposit || 0), 0);

  return {
    title: 'Deposit Report',
    headers: ['Metric', 'Amount (₹)'],
    rows: [
      ['Deposit Received', received],
      ['Deposit Held', held],
      ['Deposit Refunded', refunded],
      ['Pending Deposit (not yet collected)', pending],
    ],
  };
}

function computePaymentReport() {
  const from = document.getElementById('rfFrom')?.value || '';
  const to = document.getElementById('rfTo')?.value || '';
  const type = document.getElementById('rfType')?.value || '';

  const rows = [];
  loadBookings().forEach((b) => {
    (b.payments || [])
      .filter((p) => (!from || p.date >= from) && (!to || p.date <= to))
      .filter((p) => !type || p.type === type)
      .forEach((p) => {
        rows.push([b.booking_number, b.customer_name, PAYMENT_TYPE_LABELS[p.type], p.amount, formatDate(p.date), p.method, p.reference || '—']);
      });
  });
  rows.sort((a, b) => (a[4] < b[4] ? 1 : -1));

  return {
    title: 'Payment Report',
    headers: ['Booking #', 'Customer', 'Type', 'Amount (₹)', 'Date', 'Method', 'Reference'],
    rows,
  };
}

/**
 * Expense totals for the range the current report covers. Taken from the
 * summary endpoint, which sums in SQL, rather than by adding up fetched rows —
 * a list can be capped, and a financial report that quietly leaves rows out is
 * worse than one that fails.
 */
let REPORT_SUMMARY = null;

function reportRange() {
  if (currentReportType === 'vehicle') {
    const month = document.getElementById('rfMonth')?.value || currentMonthStr();
    const [y, m] = month.split('-').map(Number);
    return { from: `${month}-01`, to: new Date(y, m, 0).toISOString().slice(0, 10) };
  }
  // An unfiltered report means everything, so the range has to be stated —
  // left empty, the server would answer for this month alone.
  return {
    from: document.getElementById('rfFrom')?.value || '2000-01-01',
    to: document.getElementById('rfTo')?.value || '2100-12-31',
  };
}

async function renderReport() {
  try {
    REPORT_SUMMARY = await api.expenses.summary(reportRange());
  } catch {
    REPORT_SUMMARY = null;
  }

  const computers = {
    booking: computeBookingReport,
    revenue: computeRevenueReport,
    vehicle: computeVehicleReport,
    km: computeKmReport,
    deposit: computeDepositReport,
    payment: computePaymentReport,
  };
  const compute = computers[currentReportType];
  if (!compute) return;
  currentReportData = compute();

  const resultsEl = document.getElementById('reportResults');
  if (!resultsEl) return;

  if (!currentReportData.rows.length) {
    resultsEl.innerHTML = '<div class="empty-state">No data for the selected filters.</div>';
    return;
  }

  const isNumericCol = (colIndex) => currentReportData.rows.every((r) => typeof r[colIndex] === 'number');
  const numericCols = currentReportData.headers.map((_, i) => isNumericCol(i));
  const totals = currentReportData.headers.map((_, i) =>
    numericCols[i] ? currentReportData.rows.reduce((sum, r) => sum + r[i], 0) : (i === 0 ? 'Total' : '')
  );
  const showTotals = currentReportData.headers.length > 2 && numericCols.some(Boolean);

  resultsEl.innerHTML = `
    <table class="report-table">
      <thead><tr>${currentReportData.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${currentReportData.rows.map((r) => `<tr>${r.map((c, i) => `<td>${numericCols[i] && typeof c === 'number' ? formatINR(c).replace('₹', '') : c}</td>`).join('')}</tr>`).join('')}</tbody>
      ${showTotals ? `<tfoot><tr>${totals.map((t) => `<td>${typeof t === 'number' ? formatINR(t).replace('₹', '') : t}</td>`).join('')}</tr></tfoot>` : ''}
    </table>`;
}

// ---- Export ----
function exportCsv() {
  const { headers, rows, title } = currentReportData;
  if (!rows.length) return;
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\r\n');
  downloadBlob(csv, `${title.replace(/[^a-z0-9]+/gi, '-')}.csv`, 'text/csv;charset=utf-8;');
}

// Excel opens an HTML table saved with an .xls extension directly — no
// external library needed.
function exportExcel() {
  const { headers, rows, title } = currentReportData;
  if (!rows.length) return;
  const html = `<table><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  downloadBlob(html, `${title.replace(/[^a-z0-9]+/gi, '-')}.xls`, 'application/vnd.ms-excel');
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);
document.getElementById('exportPdfBtn').addEventListener('click', () => window.print());

renderReportFilters();
