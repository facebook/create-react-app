// Demo-only admin auth: a hardcoded client-side password. This keeps casual
// visitors out of the dashboard link but is NOT real security — anyone who
// views this file's source has the password. Do not treat this as
// production auth; wire up real server-side auth before going live.
const ADMIN_PASSWORD = 'nitesha2026';
const SESSION_KEY = 'nitesha_admin_session';

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function showDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  renderOverview();
  renderCarAdminGrid();
  renderInquiries();
  renderFinance();
  renderBookingList();
  renderReport();
}

function showLogin() {
  loginScreen.hidden = false;
  dashboard.hidden = true;
}

if (sessionStorage.getItem(SESSION_KEY) === 'true') {
  showDashboard();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = document.getElementById('loginPassword').value;
  if (value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    loginError.textContent = '';
    loginForm.reset();
    showDashboard();
  } else {
    loginError.textContent = 'Incorrect password. Try again.';
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

// ---- Tabs ----
const TAB_PANELS = ['dashboard', 'bookings', 'cars', 'inquiries', 'finance', 'reports'];
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    TAB_PANELS.forEach((name) => {
      document.getElementById(`panel-${name}`).hidden = target !== name;
    });
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
      <div class="admin-car-thumb">${carIllustrationSVG(car.bodyType, car.color)}</div>
      <div class="row1">
        <span class="name">${car.name}</span>
        <span class="status-badge status-badge-${car.status.replace(' ', '')}">${car.status}</span>
      </div>
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
        <button class="btn btn-danger btn-sm delete-car-btn">Delete</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.edit-car-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('.car-admin-card').dataset.id);
      openCarModal(loadCars().find((c) => c.id === id));
    });
  });
  wrap.querySelectorAll('.delete-car-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('.car-admin-card').dataset.id);
      const car = loadCars().find((c) => c.id === id);
      if (!confirm(`Delete "${car.name}"? This can't be undone.`)) return;
      saveCars(loadCars().filter((c) => c.id !== id));
      renderCarAdminGrid();
      renderOverview();
    });
  });
}

// ---- Car modal (add/edit) ----
const carModalOverlay = document.getElementById('carModalOverlay');
const carForm = document.getElementById('carForm');
const carModalTitle = document.getElementById('carModalTitle');

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
  document.getElementById('carPrice').value = car ? car.price : '';
  document.getElementById('carPrice7').value = car ? car.price7 : '';
  document.getElementById('carPrice15').value = car ? car.price15 : '';
  document.getElementById('carPrice30').value = car ? car.price30 : '';
  document.getElementById('carKmLimit').value = car ? car.kmLimitPerDay : 200;
  document.getElementById('carExtraKmRate').value = car ? car.extraKmRate : '';
  document.getElementById('carSecurityDeposit').value = car ? car.securityDeposit : '';
  document.getElementById('carCurrentKm').value = car ? car.currentKm : 0;
  carModalOverlay.hidden = false;
}

function closeCarModal() {
  carModalOverlay.hidden = true;
}

document.getElementById('addCarBtn').addEventListener('click', () => openCarModal(null));
document.getElementById('carModalCancel').addEventListener('click', closeCarModal);
carModalOverlay.addEventListener('click', (e) => {
  if (e.target === carModalOverlay) closeCarModal();
});

carForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const cars = loadCars();
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
    price: Number(document.getElementById('carPrice').value),
    price7: Number(document.getElementById('carPrice7').value) || 0,
    price15: Number(document.getElementById('carPrice15').value) || 0,
    price30: Number(document.getElementById('carPrice30').value) || 0,
    kmLimitPerDay: Number(document.getElementById('carKmLimit').value),
    extraKmRate: Number(document.getElementById('carExtraKmRate').value),
    securityDeposit: Number(document.getElementById('carSecurityDeposit').value),
    currentKm: Number(document.getElementById('carCurrentKm').value),
  };

  if (idValue) {
    const id = Number(idValue);
    const idx = cars.findIndex((c) => c.id === id);
    if (idx !== -1) cars[idx] = { ...cars[idx], ...carData };
  } else {
    cars.push({ id: nextCarId(cars), ...carData });
  }

  saveCars(cars);
  closeCarModal();
  renderCarAdminGrid();
  renderOverview();
});

// ---- Inquiries ----
function renderInquiries() {
  const wrap = document.getElementById('inquiriesWrap');
  const countBadge = document.getElementById('inquiryCount');
  const inquiries = loadInquiries();

  countBadge.textContent = inquiries.length || '';

  if (!inquiries.length) {
    wrap.innerHTML = '<div class="empty-state">No booking inquiries yet. Submissions from the public site\'s contact form will show up here.</div>';
    return;
  }

  wrap.innerHTML = inquiries.map((inq) => `
    <div class="inquiry-card">
      <div class="inquiry-info">
        <span class="inquiry-name">${inq.name || '(no name)'}</span>
        <span class="inquiry-detail">${inq.phone || '—'} · ${inq.city || '—'}</span>
      </div>
      <span class="inquiry-time">${new Date(inq.receivedAt).toLocaleString()}</span>
    </div>
  `).join('');
}

document.getElementById('clearInquiriesBtn').addEventListener('click', () => {
  if (!confirm('Clear all booking inquiries? This can\'t be undone.')) return;
  localStorage.removeItem(INQUIRY_STORE_KEY);
  renderInquiries();
  renderOverview();
});

// ---- Finance ----
const FINANCE_STORE_KEY = 'nitesha_finance_v1';

function loadTransactions() {
  try {
    const raw = localStorage.getItem(FINANCE_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransaction(txn) {
  const transactions = loadTransactions();
  transactions.unshift({ ...txn, id: Date.now(), recordedAt: new Date().toISOString() });
  localStorage.setItem(FINANCE_STORE_KEY, JSON.stringify(transactions));
}

function deleteTransaction(id) {
  localStorage.setItem(FINANCE_STORE_KEY, JSON.stringify(loadTransactions().filter((t) => t.id !== id)));
}

function financeTotals() {
  const transactions = loadTransactions();
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, balance: income - expense };
}

function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function transactionCardHTML(txn) {
  const sign = txn.type === 'income' ? '+' : '−';
  const vehicleTag = txn.vehicleId ? ` · ${vehicleLabel(txn.vehicleId)}` : '';
  return `
    <div class="transaction-card" data-id="${txn.id}">
      <div class="transaction-info">
        <span class="transaction-category">${txn.category}${vehicleTag}</span>
        <span class="transaction-note">${txn.note || 'No note'}</span>
        <span class="transaction-time">${new Date(txn.recordedAt).toLocaleString()}</span>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount ${txn.type}">${sign} ${formatINR(txn.amount)}</span>
        <button class="transaction-delete" aria-label="Delete entry" title="Delete entry">✕</button>
      </div>
    </div>`;
}

function renderFinance() {
  const wrap = document.getElementById('transactionsWrap');
  if (!wrap) return;

  const vehicleSelect = document.getElementById('txnVehicle');
  const cars = loadCars();
  vehicleSelect.innerHTML = '<option value="">General</option>' + cars.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  const transactions = loadTransactions();
  const { income, expense, balance } = financeTotals();

  document.getElementById('financeIncome').textContent = formatINR(income);
  document.getElementById('financeExpense').textContent = formatINR(expense);
  document.getElementById('financeBalance').textContent = formatINR(balance);

  if (!transactions.length) {
    wrap.innerHTML = '<div class="empty-state">No entries yet. Log a booking payment or an expense above.</div>';
    return;
  }

  wrap.innerHTML = transactions.map(transactionCardHTML).join('');
  wrap.querySelectorAll('.transaction-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('.transaction-card').dataset.id);
      deleteTransaction(id);
      renderFinance();
      renderOverview();
    });
  });
}

document.getElementById('financeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const vehicleId = document.getElementById('txnVehicle').value;
  saveTransaction({
    type: document.getElementById('txnType').value,
    category: document.getElementById('txnCategory').value,
    amount: Number(document.getElementById('txnAmount').value),
    note: document.getElementById('txnNote').value.trim(),
    vehicleId: vehicleId ? Number(vehicleId) : null,
  });
  e.target.reset();
  renderFinance();
  renderOverview();
});

// ---- Dashboard overview ----
function renderOverview() {
  const carCountEl = document.getElementById('statCarCount');
  if (!carCountEl) return;

  const cars = loadCars();
  const inquiries = loadInquiries();
  const { income, expense, balance } = financeTotals();

  carCountEl.textContent = cars.length;
  document.getElementById('statInquiryCount').textContent = inquiries.length;
  document.getElementById('statIncome').textContent = formatINR(income);
  document.getElementById('statExpense').textContent = formatINR(expense);
  document.getElementById('statBalance').textContent = formatINR(balance);

  const recentInquiries = document.getElementById('recentInquiries');
  recentInquiries.innerHTML = inquiries.length
    ? inquiries.slice(0, 5).map((inq) => `
      <div class="inquiry-card">
        <div class="inquiry-info">
          <span class="inquiry-name">${inq.name || '(no name)'}</span>
          <span class="inquiry-detail">${inq.phone || '—'} · ${inq.city || '—'}</span>
        </div>
        <span class="inquiry-time">${new Date(inq.receivedAt).toLocaleString()}</span>
      </div>`).join('')
    : '<div class="empty-state">No inquiries yet.</div>';

  const recentTransactions = document.getElementById('recentTransactions');
  const transactions = loadTransactions();
  recentTransactions.innerHTML = transactions.length
    ? transactions.slice(0, 5).map(transactionCardHTML).join('')
    : '<div class="empty-state">No transactions yet.</div>';
  recentTransactions.querySelectorAll('.transaction-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('.transaction-card').dataset.id);
      deleteTransaction(id);
      renderOverview();
      renderFinance();
    });
  });

  renderRentalOverview();
}

// ==========================================================================
// Bookings / Rental Management
// ==========================================================================

function formatDate(isoOrDateStr) {
  if (!isoOrDateStr) return '—';
  return new Date(isoOrDateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('en-IN');
}

// Downscales an image file client-side (keeps localStorage usage in check)
// and resolves to a JPEG data URL.
function fileToCompressedDataURL(file, maxDim = 900, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function proofThumbHTML(dataUrl, label) {
  if (!dataUrl) return '';
  return `<img src="${dataUrl}" alt="${label}" title="${label}" />`;
}

function populateVehicleSelect(selectEl, selectedId) {
  const cars = loadCars();
  selectEl.innerHTML = cars.map((c) => `<option value="${c.id}">${c.name} (${c.regNumber || 'no reg. no.'})</option>`).join('');
  if (selectedId) selectEl.value = selectedId;
}

function vehicleLabel(vehicleId) {
  const car = loadCars().find((c) => c.id === vehicleId);
  return car ? car.name : '(vehicle removed)';
}

// ---- Booking list ----
let bookingStatusFilter = 'all';

document.querySelectorAll('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    bookingStatusFilter = chip.dataset.status;
    renderBookingList();
  });
});

// Small chip showing where a booking stands against the clock. Sits beside the
// recorded status, which only ever moves on real pickup/return events.
function scheduleChipHTML(booking) {
  const st = bookingScheduleState(booking);
  return st ? `<span class="sched-chip sched-${st.tone}" title="Derived from the booking dates">${st.label}</span>` : "";
}

function renderBookingList() {
  const wrap = document.getElementById('bookingListWrap');
  const countBadge = document.getElementById('bookingCount');
  if (!wrap) return;

  const bookings = loadBookings();
  countBadge.textContent = bookings.length || '';

  const filtered = bookingStatusFilter === 'all' ? bookings : bookings.filter((b) => b.status === bookingStatusFilter);

  if (!filtered.length) {
    wrap.innerHTML = '<div class="empty-state">No bookings yet. Click "+ New Booking" to create one.</div>';
    return;
  }

  wrap.innerHTML = filtered.map((b) => {
    const balance = rentalBalanceDue(b);
    return `
      <div class="booking-card" data-id="${b.id}">
        <div class="booking-card-main">
          <span class="booking-card-number">${b.bookingNumber}</span>
          <span class="booking-card-customer">${b.customerName}</span>
          <span class="booking-card-meta">${vehicleLabel(b.vehicleId)} · ${formatDate(b.startDate)} → ${formatDate(b.returnDate)} · ${b.rentalDurationDays} day(s)</span>
        </div>
        <div class="booking-card-right">
          <span class="status-stack">
            <span class="status-badge status-badge-${b.status}">${b.status}</span>
            ${scheduleChipHTML(b)}
          </span>
          <div class="booking-card-balance">
            <span class="label">Balance</span>
            <span class="amount">${formatINR(balance)}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  wrap.querySelectorAll('.booking-card').forEach((card) => {
    card.addEventListener('click', () => openBookingDetail(Number(card.dataset.id)));
  });
}

// ---- Booking create/edit modal ----
const bookingModalOverlay = document.getElementById('bookingModalOverlay');
const bookingForm = document.getElementById('bookingForm');
const bookingVehicleSelect = document.getElementById('bkVehicle');

function updateBookingDurationPreview() {
  const days = calcRentalDurationDays(
    document.getElementById('bkStartDate').value,
    document.getElementById('bkStartTime').value,
    document.getElementById('bkReturnDate').value,
    document.getElementById('bkReturnTime').value
  );
  document.getElementById('bkDurationPreview').textContent = `${days} day${days === 1 ? '' : 's'}`;
  return days;
}

function checkBookingConflict(excludeId) {
  const vehicleId = Number(bookingVehicleSelect.value);
  const startDate = document.getElementById('bkStartDate').value;
  const startTime = document.getElementById('bkStartTime').value;
  const returnDate = document.getElementById('bkReturnDate').value;
  const returnTime = document.getElementById('bkReturnTime').value;
  const errorEl = document.getElementById('bookingConflictError');

  if (!startDate || !returnDate) {
    errorEl.textContent = '';
    return false;
  }
  const conflict = isVehicleDoubleBooked(vehicleId, startDate, startTime, returnDate, returnTime, excludeId);
  errorEl.textContent = conflict ? 'Vehicle is already booked for the selected dates.' : '';
  return conflict;
}

['bkStartDate', 'bkStartTime', 'bkReturnDate', 'bkReturnTime'].forEach((id) => {
  document.getElementById(id).addEventListener('change', () => {
    updateBookingDurationPreview();
    checkBookingConflict(Number(document.getElementById('bookingId').value) || null);
  });
});

bookingVehicleSelect.addEventListener('change', () => {
  const car = loadCars().find((c) => c.id === Number(bookingVehicleSelect.value));
  if (!car) return;
  document.getElementById('bkVehicleReg').value = car.regNumber || '';
  document.getElementById('bkKmLimit').value = car.kmLimitPerDay;
  document.getElementById('bkExtraKmRate').value = car.extraKmRate;
  checkBookingConflict(Number(document.getElementById('bookingId').value) || null);
});

function openBookingModal(booking) {
  bookingForm.reset();
  populateVehicleSelect(bookingVehicleSelect, booking ? booking.vehicleId : null);
  document.getElementById('bookingId').value = booking ? booking.id : '';
  document.getElementById('bookingModalTitle').textContent = booking ? 'Edit Booking' : 'New Booking';
  document.getElementById('bookingNumberPreview').textContent = booking
    ? `Booking Number: ${booking.bookingNumber}`
    : `Booking Number: ${generateBookingNumber(loadBookings())} (auto-generated on save)`;
  document.getElementById('bookingConflictError').textContent = '';

  document.getElementById('bkCustomerName').value = booking ? booking.customerName : '';
  document.getElementById('bkPhone').value = booking ? booking.phone : '';
  document.getElementById('bkAddress').value = booking ? booking.address : '';
  document.getElementById('bkLicence').value = booking ? booking.licenceNumber : '';
  document.getElementById('bkStartDate').value = booking ? booking.startDate : '';
  document.getElementById('bkStartTime').value = booking ? booking.startTime : '10:00';
  document.getElementById('bkReturnDate').value = booking ? booking.returnDate : '';
  document.getElementById('bkReturnTime').value = booking ? booking.returnTime : '10:00';
  document.getElementById('bkRentalAmount').value = booking ? booking.rentalAmount : '';
  document.getElementById('bkNotes').value = booking ? booking.notes : '';

  if (booking) {
    const car = loadCars().find((c) => c.id === booking.vehicleId);
    document.getElementById('bkVehicleReg').value = car ? car.regNumber : (booking.vehicleRegNumber || '');
    document.getElementById('bkKmLimit').value = booking.kmLimitPerDay;
    document.getElementById('bkExtraKmRate').value = booking.extraKmRate;
  } else {
    bookingVehicleSelect.dispatchEvent(new Event('change'));
  }

  updateBookingDurationPreview();
  bookingModalOverlay.hidden = false;
}

function closeBookingModal() {
  bookingModalOverlay.hidden = true;
}

document.getElementById('addBookingBtn').addEventListener('click', () => openBookingModal(null));
document.getElementById('bookingModalCancel').addEventListener('click', closeBookingModal);
bookingModalOverlay.addEventListener('click', (e) => { if (e.target === bookingModalOverlay) closeBookingModal(); });

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const idValue = document.getElementById('bookingId').value;
  const excludeId = idValue ? Number(idValue) : null;

  if (checkBookingConflict(excludeId)) return;

  const vehicleId = Number(bookingVehicleSelect.value);
  const car = loadCars().find((c) => c.id === vehicleId);
  const rentalDurationDays = updateBookingDurationPreview();

  const data = {
    customerName: document.getElementById('bkCustomerName').value.trim(),
    phone: document.getElementById('bkPhone').value.trim(),
    address: document.getElementById('bkAddress').value.trim(),
    licenceNumber: document.getElementById('bkLicence').value.trim(),
    vehicleId,
    vehicleRegNumber: car ? car.regNumber : '',
    startDate: document.getElementById('bkStartDate').value,
    startTime: document.getElementById('bkStartTime').value,
    returnDate: document.getElementById('bkReturnDate').value,
    returnTime: document.getElementById('bkReturnTime').value,
    rentalDurationDays,
    rentalAmount: Number(document.getElementById('bkRentalAmount').value),
    kmLimitPerDay: Number(document.getElementById('bkKmLimit').value),
    extraKmRate: Number(document.getElementById('bkExtraKmRate').value),
    notes: document.getElementById('bkNotes').value.trim(),
  };

  if (excludeId) {
    updateBookingDetails(excludeId, data);
  } else {
    createBooking(data);
  }

  closeBookingModal();
  renderBookingList();
  renderOverview();
});

// ---- Booking detail ----
const bookingDetailOverlay = document.getElementById('bookingDetailOverlay');
let currentDetailBookingId = null;

function openBookingDetail(id) {
  currentDetailBookingId = id;
  renderBookingDetail(id);
  bookingDetailOverlay.hidden = false;
}

function closeBookingDetail() {
  bookingDetailOverlay.hidden = true;
  currentDetailBookingId = null;
}

document.getElementById('bookingDetailClose').addEventListener('click', closeBookingDetail);
bookingDetailOverlay.addEventListener('click', (e) => { if (e.target === bookingDetailOverlay) closeBookingDetail(); });

function refreshAfterBookingChange() {
  renderBookingList();
  renderOverview();
  if (currentDetailBookingId) renderBookingDetail(currentDetailBookingId);
}

function timelineHTML(booking) {
  if (!booking.timeline || !booking.timeline.length) return '<p class="detail-empty">No activity yet.</p>';
  return `<ul class="timeline-list">${booking.timeline.map((t) => `
    <li><span class="t-event">${t.event}</span><span class="t-time">${formatDateTime(t.at)}</span></li>
  `).join('')}</ul>`;
}

function renderBookingDetail(id) {
  const booking = getBooking(id);
  const body = document.getElementById('bookingDetailBody');
  if (!booking) { body.innerHTML = '<p class="detail-empty">Booking not found.</p>'; return; }

  const car = loadCars().find((c) => c.id === booking.vehicleId);
  const balance = rentalBalanceDue(booking);
  const kmInfo = booking.return ? computeExtraKmForBooking(booking) : null;

  document.getElementById('bookingDetailTitle').innerHTML =
    `${booking.bookingNumber} <span class="status-badge status-badge-${booking.status}">${booking.status}</span> ${scheduleChipHTML(booking)}`;

  const proofs = [];
  booking.payments.forEach((p) => { if (p.proof) proofs.push({ url: p.proof, label: `${PAYMENT_TYPE_LABELS[p.type]} payment` }); });
  if (booking.securityDeposit?.proof) proofs.push({ url: booking.securityDeposit.proof, label: 'Security deposit' });
  if (booking.depositRefund?.proof) proofs.push({ url: booking.depositRefund.proof, label: 'Deposit refund' });
  (booking.pickup?.photos || []).forEach((url) => proofs.push({ url, label: 'Pickup photo' }));
  (booking.return?.photos || []).forEach((url) => proofs.push({ url, label: 'Return photo' }));

  body.innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">
        <span>Customer &amp; Rental Details</span>
        <div>
          <button class="btn btn-outline btn-sm" id="detailEditBtn">Edit</button>
          ${booking.status !== 'Cancelled' && booking.status !== 'Completed' ? '<button class="btn btn-ghost btn-sm" id="detailCancelBtn">Cancel Booking</button>' : ''}
          ${booking.status !== 'Completed' && booking.status !== 'Cancelled' ? '<button class="btn btn-primary btn-sm" id="detailCompleteBtn">Mark Completed</button>' : ''}
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-field"><span class="k">Customer</span><span class="v">${booking.customerName}</span></div>
        <div class="detail-field"><span class="k">Phone</span><span class="v">${booking.phone}</span></div>
        <div class="detail-field"><span class="k">Address</span><span class="v">${booking.address || '—'}</span></div>
        <div class="detail-field"><span class="k">Licence No.</span><span class="v">${booking.licenceNumber}</span></div>
        <div class="detail-field"><span class="k">Vehicle</span><span class="v">${car ? car.name : '(removed)'}</span></div>
        <div class="detail-field"><span class="k">Reg. Number</span><span class="v">${booking.vehicleRegNumber || '—'}</span></div>
        <div class="detail-field"><span class="k">Start</span><span class="v">${formatDate(booking.startDate)} ${booking.startTime}</span></div>
        <div class="detail-field"><span class="k">Return</span><span class="v">${formatDate(booking.returnDate)} ${booking.returnTime}</span></div>
        <div class="detail-field"><span class="k">Duration</span><span class="v">${booking.rentalDurationDays} day(s)</span></div>
        <div class="detail-field"><span class="k">Rental Amount</span><span class="v">${formatINR(booking.rentalAmount)}</span></div>
        <div class="detail-field"><span class="k">KM Limit</span><span class="v">${booking.kmLimitPerDay}/day</span></div>
        <div class="detail-field"><span class="k">Extra KM Rate</span><span class="v">₹${booking.extraKmRate}/km</span></div>
      </div>
      ${booking.notes ? `<p class="field-hint" style="margin-top:10px">Notes: ${booking.notes}</p>` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>Payments</span>
        <button class="btn btn-outline btn-sm" id="detailAddPaymentBtn">+ Add Payment</button>
      </div>
      ${booking.payments.length ? booking.payments.map((p) => `
        <div class="payment-row">
          <span>${PAYMENT_TYPE_LABELS[p.type]} · ${p.method} ${p.reference ? `(${p.reference})` : ''} · ${formatDate(p.date)}</span>
          <span class="amount">${formatINR(p.amount)}</span>
        </div>`).join('') : '<p class="detail-empty">No payments recorded yet.</p>'}
      <div class="detail-grid" style="margin-top:12px">
        <div class="detail-field"><span class="k">Rental Amount Due</span><span class="v">${formatINR(rentalAmountDue(booking))}</span></div>
        <div class="detail-field"><span class="k">Total Paid</span><span class="v">${formatINR(rentalPaymentsTotal(booking))}</span></div>
        <div class="detail-field"><span class="k">Balance</span><span class="v">${formatINR(balance)}</span></div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>Security Deposit</span>
        ${!booking.securityDeposit ? '<button class="btn btn-outline btn-sm" id="detailAddDepositBtn">+ Add Deposit</button>' : ''}
      </div>
      ${booking.securityDeposit ? `
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Amount</span><span class="v">${formatINR(booking.securityDeposit.amount)}</span></div>
          <div class="detail-field"><span class="k">Date</span><span class="v">${formatDate(booking.securityDeposit.date)}</span></div>
          <div class="detail-field"><span class="k">Method</span><span class="v">${booking.securityDeposit.method}</span></div>
          <div class="detail-field"><span class="k">Reference</span><span class="v">${booking.securityDeposit.reference || '—'}</span></div>
        </div>
        <p class="field-hint">Tracked separately — not counted as rental revenue.</p>
        ${!booking.depositRefund ? '<button class="btn btn-outline btn-sm" id="detailRefundBtn">Refund Deposit</button>' : ''}
      ` : '<p class="detail-empty">No security deposit recorded yet.</p>'}
      ${booking.depositRefund ? `
        <p class="modal-section-label">Refund</p>
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Deduction</span><span class="v">${formatINR(booking.depositRefund.deduction)}</span></div>
          <div class="detail-field"><span class="k">Reason</span><span class="v">${booking.depositRefund.reason || '—'}</span></div>
          <div class="detail-field"><span class="k">Refund Amount</span><span class="v">${formatINR(booking.depositRefund.refundAmount)}</span></div>
          <div class="detail-field"><span class="k">Refund Date</span><span class="v">${formatDate(booking.depositRefund.refundDate)}</span></div>
          <div class="detail-field"><span class="k">Method</span><span class="v">${booking.depositRefund.method}</span></div>
        </div>
      ` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>Vehicle Pickup</span>
        ${!booking.pickup ? '<button class="btn btn-outline btn-sm" id="detailPickupBtn">Record Pickup</button>' : ''}
      </div>
      ${booking.pickup ? `
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Date &amp; Time</span><span class="v">${formatDate(booking.pickup.date)} ${booking.pickup.time}</span></div>
          <div class="detail-field"><span class="k">Starting KM</span><span class="v">${booking.pickup.startKm.toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Fuel Level</span><span class="v">${booking.pickup.fuelLevel}</span></div>
          <div class="detail-field"><span class="k">Condition</span><span class="v">${booking.pickup.condition || '—'}</span></div>
        </div>
      ` : '<p class="detail-empty">Not recorded yet.</p>'}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">
        <span>Vehicle Return</span>
        ${booking.pickup && !booking.return ? '<button class="btn btn-outline btn-sm" id="detailReturnBtn">Record Return</button>' : ''}
      </div>
      ${booking.return ? `
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Date &amp; Time</span><span class="v">${formatDate(booking.return.date)} ${booking.return.time}</span></div>
          <div class="detail-field"><span class="k">Ending KM</span><span class="v">${booking.return.endKm.toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Fuel Level</span><span class="v">${booking.return.fuelLevel}</span></div>
          <div class="detail-field"><span class="k">Condition</span><span class="v">${booking.return.condition || '—'}</span></div>
        </div>
        <p class="modal-section-label">Extra KM</p>
        <div class="detail-grid">
          <div class="detail-field"><span class="k">Total KM</span><span class="v">${kmInfo.totalKm.toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Allowed KM</span><span class="v">${kmInfo.allowedKm.toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Extra KM</span><span class="v">${kmInfo.extraKm.toLocaleString('en-IN')}</span></div>
          <div class="detail-field"><span class="k">Extra KM Charge</span><span class="v">${formatINR(kmInfo.extraKmCharge)}</span></div>
        </div>
      ` : `<p class="detail-empty">${booking.pickup ? 'Not recorded yet.' : 'Record pickup first.'}</p>`}
    </div>

    ${proofs.length ? `
    <div class="detail-section">
      <div class="detail-section-title"><span>Documents / Proofs</span></div>
      <div class="proof-preview">${proofs.map((p) => proofThumbHTML(p.url, p.label)).join('')}</div>
    </div>` : ''}

    <div class="detail-section">
      <div class="detail-section-title"><span>Booking Timeline</span></div>
      ${timelineHTML(booking)}
    </div>
  `;

  document.getElementById('detailEditBtn').addEventListener('click', () => { closeBookingDetail(); openBookingModal(booking); });
  document.getElementById('detailCancelBtn')?.addEventListener('click', () => {
    if (!confirm('Cancel this booking?')) return;
    cancelBooking(booking.id);
    refreshAfterBookingChange();
  });
  document.getElementById('detailCompleteBtn')?.addEventListener('click', () => {
    if (!confirm('Mark this booking as completed?')) return;
    completeBooking(booking.id);
    refreshAfterBookingChange();
  });
  document.getElementById('detailAddPaymentBtn')?.addEventListener('click', () => openPaymentModal(booking.id));
  document.getElementById('detailAddDepositBtn')?.addEventListener('click', () => openDepositModal(booking.id));
  document.getElementById('detailRefundBtn')?.addEventListener('click', () => openRefundModal(booking.id));
  document.getElementById('detailPickupBtn')?.addEventListener('click', () => openPickupModal(booking.id));
  document.getElementById('detailReturnBtn')?.addEventListener('click', () => openReturnModal(booking.id));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function setVehicleStatus(vehicleId, status) {
  const cars = loadCars();
  const idx = cars.findIndex((c) => c.id === vehicleId);
  if (idx === -1) return;
  cars[idx].status = status;
  saveCars(cars);
}

// ---- Payment modal ----
const paymentModalOverlay = document.getElementById('paymentModalOverlay');
let pendingPaymentProof = null;

function openPaymentModal(bookingId) {
  document.getElementById('paymentForm').reset();
  pendingPaymentProof = null;
  document.getElementById('paymentProofPreview').innerHTML = '';
  document.getElementById('paymentBookingId').value = bookingId;
  document.getElementById('paymentDate').value = todayStr();
  paymentModalOverlay.hidden = false;
}
document.getElementById('paymentModalCancel').addEventListener('click', () => { paymentModalOverlay.hidden = true; });
paymentModalOverlay.addEventListener('click', (e) => { if (e.target === paymentModalOverlay) paymentModalOverlay.hidden = true; });

document.getElementById('paymentProof').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  pendingPaymentProof = await fileToCompressedDataURL(file);
  document.getElementById('paymentProofPreview').innerHTML = proofThumbHTML(pendingPaymentProof, 'Payment proof');
});

document.getElementById('paymentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const bookingId = Number(document.getElementById('paymentBookingId').value);
  addPayment(bookingId, {
    type: document.getElementById('paymentType').value,
    amount: Number(document.getElementById('paymentAmount').value),
    date: document.getElementById('paymentDate').value,
    method: document.getElementById('paymentMethod').value,
    reference: document.getElementById('paymentReference').value.trim(),
    notes: document.getElementById('paymentNotes').value.trim(),
    proof: pendingPaymentProof,
  });
  paymentModalOverlay.hidden = true;
  refreshAfterBookingChange();
});

// ---- Security deposit modal ----
const depositModalOverlay = document.getElementById('depositModalOverlay');
let pendingDepositProof = null;

function openDepositModal(bookingId) {
  document.getElementById('depositForm').reset();
  pendingDepositProof = null;
  document.getElementById('depositProofPreview').innerHTML = '';
  document.getElementById('depositBookingId').value = bookingId;
  document.getElementById('depositDate').value = todayStr();
  const car = loadCars().find((c) => c.id === getBooking(bookingId)?.vehicleId);
  if (car) document.getElementById('depositAmount').value = car.securityDeposit;
  depositModalOverlay.hidden = false;
}
document.getElementById('depositModalCancel').addEventListener('click', () => { depositModalOverlay.hidden = true; });
depositModalOverlay.addEventListener('click', (e) => { if (e.target === depositModalOverlay) depositModalOverlay.hidden = true; });

document.getElementById('depositProof').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  pendingDepositProof = await fileToCompressedDataURL(file);
  document.getElementById('depositProofPreview').innerHTML = proofThumbHTML(pendingDepositProof, 'Deposit proof');
});

document.getElementById('depositForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const bookingId = Number(document.getElementById('depositBookingId').value);
  setSecurityDeposit(bookingId, {
    amount: Number(document.getElementById('depositAmount').value),
    date: document.getElementById('depositDate').value,
    method: document.getElementById('depositMethod').value,
    reference: document.getElementById('depositReference').value.trim(),
    notes: document.getElementById('depositNotes').value.trim(),
    proof: pendingDepositProof,
  });
  depositModalOverlay.hidden = true;
  refreshAfterBookingChange();
});

// ---- Deposit refund modal ----
const refundModalOverlay = document.getElementById('refundModalOverlay');
let pendingRefundProof = null;

function updateRefundPreview() {
  const bookingId = Number(document.getElementById('refundBookingId').value);
  const booking = getBooking(bookingId);
  const original = booking?.securityDeposit?.amount || 0;
  const deduction = Number(document.getElementById('refundDeduction').value) || 0;
  document.getElementById('refundAmountPreview').textContent = formatINR(Math.max(0, original - deduction));
}

function openRefundModal(bookingId) {
  document.getElementById('refundForm').reset();
  pendingRefundProof = null;
  document.getElementById('refundProofPreview').innerHTML = '';
  document.getElementById('refundBookingId').value = bookingId;
  document.getElementById('refundDate').value = todayStr();
  document.getElementById('refundDeduction').value = 0;
  const booking = getBooking(bookingId);
  document.getElementById('refundOriginalDeposit').textContent = formatINR(booking?.securityDeposit?.amount || 0);
  updateRefundPreview();
  refundModalOverlay.hidden = false;
}
document.getElementById('refundModalCancel').addEventListener('click', () => { refundModalOverlay.hidden = true; });
refundModalOverlay.addEventListener('click', (e) => { if (e.target === refundModalOverlay) refundModalOverlay.hidden = true; });
document.getElementById('refundDeduction').addEventListener('input', updateRefundPreview);

document.getElementById('refundProof').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  pendingRefundProof = await fileToCompressedDataURL(file);
  document.getElementById('refundProofPreview').innerHTML = proofThumbHTML(pendingRefundProof, 'Refund proof');
});

document.getElementById('refundForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const bookingId = Number(document.getElementById('refundBookingId').value);
  setDepositRefund(bookingId, {
    deduction: Number(document.getElementById('refundDeduction').value) || 0,
    reason: document.getElementById('refundReason').value.trim(),
    refundDate: document.getElementById('refundDate').value,
    method: document.getElementById('refundMethod').value,
    reference: document.getElementById('refundReference').value.trim(),
    notes: document.getElementById('refundNotes').value.trim(),
    proof: pendingRefundProof,
  });
  refundModalOverlay.hidden = true;
  refreshAfterBookingChange();
});

// ---- Pickup modal ----
const pickupModalOverlay = document.getElementById('pickupModalOverlay');
let pendingPickupPhotos = [];

function openPickupModal(bookingId) {
  document.getElementById('pickupForm').reset();
  pendingPickupPhotos = [];
  document.getElementById('pickupPhotosPreview').innerHTML = '';
  document.getElementById('pickupBookingId').value = bookingId;
  document.getElementById('pickupDateField').value = todayStr();
  document.getElementById('pickupTimeField').value = new Date().toTimeString().slice(0, 5);
  const car = loadCars().find((c) => c.id === getBooking(bookingId)?.vehicleId);
  if (car) document.getElementById('pickupStartKm').value = car.currentKm;
  pickupModalOverlay.hidden = false;
}
document.getElementById('pickupModalCancel').addEventListener('click', () => { pickupModalOverlay.hidden = true; });
pickupModalOverlay.addEventListener('click', (e) => { if (e.target === pickupModalOverlay) pickupModalOverlay.hidden = true; });

document.getElementById('pickupPhotos').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  pendingPickupPhotos = await Promise.all(files.map((f) => fileToCompressedDataURL(f)));
  document.getElementById('pickupPhotosPreview').innerHTML = pendingPickupPhotos.map((url) => proofThumbHTML(url, 'Pickup photo')).join('');
});

document.getElementById('pickupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const bookingId = Number(document.getElementById('pickupBookingId').value);
  const booking = setPickup(bookingId, {
    date: document.getElementById('pickupDateField').value,
    time: document.getElementById('pickupTimeField').value,
    startKm: Number(document.getElementById('pickupStartKm').value),
    fuelLevel: document.getElementById('pickupFuelLevel').value,
    condition: document.getElementById('pickupCondition').value.trim(),
    notes: document.getElementById('pickupNotes').value.trim(),
    photos: pendingPickupPhotos,
  });
  if (booking) setVehicleStatus(booking.vehicleId, 'On Rental');
  pickupModalOverlay.hidden = true;
  renderCarAdminGrid();
  refreshAfterBookingChange();
});

// ---- Return modal ----
const returnModalOverlay = document.getElementById('returnModalOverlay');
let pendingReturnPhotos = [];

function updateReturnKmPreview() {
  const bookingId = Number(document.getElementById('returnBookingId').value);
  const booking = getBooking(bookingId);
  const endKm = Number(document.getElementById('returnEndKm').value) || 0;
  if (!booking || !booking.pickup) return;
  const totalKm = Math.max(0, endKm - booking.pickup.startKm);
  const allowedKm = computeAllowedKm(booking.rentalDurationDays, booking.kmLimitPerDay);
  const extraKm = computeExtraKm(totalKm, allowedKm);
  const extraCharge = computeExtraKmCharge(extraKm, booking.extraKmRate);
  document.getElementById('returnKmPreview').textContent =
    `Total KM: ${totalKm.toLocaleString('en-IN')} · Allowed: ${allowedKm.toLocaleString('en-IN')} · Extra: ${extraKm.toLocaleString('en-IN')} km (${formatINR(extraCharge)})`;
}

function openReturnModal(bookingId) {
  document.getElementById('returnForm').reset();
  pendingReturnPhotos = [];
  document.getElementById('returnPhotosPreview').innerHTML = '';
  document.getElementById('returnBookingId').value = bookingId;
  document.getElementById('returnDateField').value = todayStr();
  document.getElementById('returnTimeField').value = new Date().toTimeString().slice(0, 5);
  document.getElementById('returnKmPreview').textContent = '';
  returnModalOverlay.hidden = false;
}
document.getElementById('returnModalCancel').addEventListener('click', () => { returnModalOverlay.hidden = true; });
returnModalOverlay.addEventListener('click', (e) => { if (e.target === returnModalOverlay) returnModalOverlay.hidden = true; });
document.getElementById('returnEndKm').addEventListener('input', updateReturnKmPreview);

document.getElementById('returnPhotos').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  pendingReturnPhotos = await Promise.all(files.map((f) => fileToCompressedDataURL(f)));
  document.getElementById('returnPhotosPreview').innerHTML = pendingReturnPhotos.map((url) => proofThumbHTML(url, 'Return photo')).join('');
});

document.getElementById('returnForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const bookingId = Number(document.getElementById('returnBookingId').value);
  const booking = setReturn(bookingId, {
    date: document.getElementById('returnDateField').value,
    time: document.getElementById('returnTimeField').value,
    endKm: Number(document.getElementById('returnEndKm').value),
    fuelLevel: document.getElementById('returnFuelLevel').value,
    condition: document.getElementById('returnCondition').value.trim(),
    notes: document.getElementById('returnNotes').value.trim(),
    photos: pendingReturnPhotos,
  });
  if (booking) {
    setVehicleStatus(booking.vehicleId, 'Available');
    const cars = loadCars();
    const idx = cars.findIndex((c) => c.id === booking.vehicleId);
    if (idx !== -1) { cars[idx].currentKm = booking.return.endKm; saveCars(cars); }
  }
  returnModalOverlay.hidden = true;
  renderCarAdminGrid();
  refreshAfterBookingChange();
});

// ---- Dashboard: Rental Overview (point 9) ----
function renderRentalOverview() {
  const grid = document.getElementById('rentalStatGrid');
  if (!grid) return;

  const bookings = loadBookings().filter((b) => b.status !== 'Cancelled');
  const today = todayStr();

  const todaysBookings = bookings.filter((b) => b.startDate === today).length;
  const activeRentals = bookings.filter((b) => b.status === 'Active').length;
  const upcomingBookings = bookings.filter((b) => b.status === 'Confirmed' && b.startDate >= today).length;

  // Rental Revenue and Extra KM Revenue are kept separate (rule 15) —
  // neither is summed twice, and Net Revenue derives from these plus expenses.
  const rentalRevenue = bookings.reduce((sum, b) => sum + b.rentalAmount, 0);
  const advanceReceived = bookings.reduce((sum, b) => sum + (b.payments || []).filter((p) => p.type === 'advance').reduce((s, p) => s + p.amount, 0), 0);
  const pendingBalance = bookings.reduce((sum, b) => sum + Math.max(0, rentalBalanceDue(b)), 0);
  const depositHeld = bookings.reduce((sum, b) => sum + (b.securityDeposit && !b.depositRefund ? b.securityDeposit.amount : 0), 0);
  const depositRefunded = bookings.reduce((sum, b) => sum + (b.depositRefund ? b.depositRefund.refundAmount : 0), 0);
  const returnedBookings = bookings.filter((b) => b.return);
  const extraKmRevenue = returnedBookings.reduce((sum, b) => sum + computeExtraKmForBooking(b).extraKmCharge, 0);
  const totalKm = returnedBookings.reduce((sum, b) => sum + computeTotalKm(b), 0);
  const totalExpenses = financeTotals().expense;
  const netRevenue = rentalRevenue + extraKmRevenue - totalExpenses;

  document.getElementById('statTodayBookings').textContent = todaysBookings;
  document.getElementById('statActiveRentals').textContent = activeRentals;
  document.getElementById('statUpcomingBookings').textContent = upcomingBookings;
  document.getElementById('statRentalRevenue').textContent = formatINR(rentalRevenue);
  document.getElementById('statAdvanceReceived').textContent = formatINR(advanceReceived);
  document.getElementById('statPendingBalance').textContent = formatINR(pendingBalance);
  document.getElementById('statDepositHeld').textContent = formatINR(depositHeld);
  document.getElementById('statDepositRefunded').textContent = formatINR(depositRefunded);
  document.getElementById('statExtraKmRevenue').textContent = formatINR(extraKmRevenue);
  document.getElementById('statTotalKm').textContent = totalKm.toLocaleString('en-IN');
  document.getElementById('statTotalExpenses').textContent = formatINR(totalExpenses);
  document.getElementById('statNetRevenue').textContent = formatINR(netRevenue);

  const activeUpcoming = bookings
    .filter((b) => b.status === 'Active' || (b.status === 'Confirmed' && b.startDate >= today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 8);

  const wrap = document.getElementById('activeUpcomingBookings');
  wrap.innerHTML = activeUpcoming.length
    ? activeUpcoming.map((b) => `
      <div class="booking-card" data-id="${b.id}">
        <div class="booking-card-main">
          <span class="booking-card-number">${b.bookingNumber}</span>
          <span class="booking-card-customer">${b.customerName}</span>
          <span class="booking-card-meta">${vehicleLabel(b.vehicleId)} · ${formatDate(b.startDate)} → ${formatDate(b.returnDate)}</span>
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
    document.querySelectorAll('.report-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
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
    .filter((b) => (!from || b.startDate >= from) && (!to || b.startDate <= to))
    .filter((b) => !vehicleId || b.vehicleId === Number(vehicleId))
    .filter((b) => !status || b.status === status)
    .map((b) => [
      b.bookingNumber, b.customerName, vehicleLabel(b.vehicleId), formatDate(b.startDate),
      formatDate(b.returnDate), b.rentalDurationDays, b.status, b.rentalAmount, rentalBalanceDue(b),
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

  const bookings = loadBookings().filter((b) => b.status !== 'Cancelled' && (!from || b.startDate >= from) && (!to || b.startDate <= to));
  const rentalRevenue = bookings.reduce((sum, b) => sum + b.rentalAmount, 0);
  const extraKmRevenue = bookings.filter((b) => b.return).reduce((sum, b) => sum + computeExtraKmForBooking(b).extraKmCharge, 0);
  const expenses = loadTransactions()
    .filter((t) => t.type === 'expense' && (!from || t.recordedAt.slice(0, 10) >= from) && (!to || t.recordedAt.slice(0, 10) <= to))
    .reduce((sum, t) => sum + t.amount, 0);
  const netRevenue = rentalRevenue + extraKmRevenue - expenses;

  return {
    title: 'Revenue Report',
    headers: ['Metric', 'Amount (₹)'],
    rows: [
      ['Rental Revenue', rentalRevenue],
      ['Extra KM Revenue', extraKmRevenue],
      ['Expenses', expenses],
      ['Net Revenue', netRevenue],
    ],
  };
}

function computeVehicleReport() {
  const month = document.getElementById('rfMonth')?.value || currentMonthStr();
  const vehicleId = Number(document.getElementById('rfVehicle')?.value);
  if (!vehicleId) return { title: 'Vehicle Report', headers: ['Metric', 'Value'], rows: [] };

  const bookings = loadBookings().filter((b) => b.vehicleId === vehicleId && b.startDate.startsWith(month));
  const nonCancelled = bookings.filter((b) => b.status !== 'Cancelled');
  const completed = bookings.filter((b) => b.status === 'Completed');
  const returned = nonCancelled.filter((b) => b.return);

  const totalDays = nonCancelled.reduce((sum, b) => sum + b.rentalDurationDays, 0);
  const rentalRevenue = nonCancelled.reduce((sum, b) => sum + b.rentalAmount, 0);
  const advanceReceived = nonCancelled.reduce((sum, b) => sum + (b.payments || []).filter((p) => p.type === 'advance').reduce((s, p) => s + p.amount, 0), 0);
  const balanceReceived = nonCancelled.reduce((sum, b) => sum + (b.payments || []).filter((p) => p.type !== 'advance').reduce((s, p) => s + p.amount, 0), 0);
  const totalKm = returned.reduce((sum, b) => sum + computeTotalKm(b), 0);
  const allowedKm = returned.reduce((sum, b) => sum + computeAllowedKm(b.rentalDurationDays, b.kmLimitPerDay), 0);
  const extraKm = returned.reduce((sum, b) => sum + computeExtraKmForBooking(b).extraKm, 0);
  const extraKmRevenue = returned.reduce((sum, b) => sum + computeExtraKmForBooking(b).extraKmCharge, 0);
  const depositsReceived = nonCancelled.reduce((sum, b) => sum + (b.securityDeposit ? b.securityDeposit.amount : 0), 0);
  const depositsRefunded = nonCancelled.reduce((sum, b) => sum + (b.depositRefund ? b.depositRefund.refundAmount : 0), 0);
  const expenses = loadTransactions()
    .filter((t) => t.type === 'expense' && t.vehicleId === vehicleId && t.recordedAt.slice(0, 7) === month)
    .reduce((sum, t) => sum + t.amount, 0);
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
    .filter((b) => b.return)
    .filter((b) => (!from || b.return.date >= from) && (!to || b.return.date <= to))
    .filter((b) => !vehicleId || b.vehicleId === Number(vehicleId))
    .map((b) => {
      const { totalKm, allowedKm, extraKm, extraKmCharge } = computeExtraKmForBooking(b);
      return [b.bookingNumber, vehicleLabel(b.vehicleId), formatDate(b.return.date), totalKm, allowedKm, extraKm, extraKmCharge];
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

  const bookings = loadBookings().filter((b) => b.status !== 'Cancelled' && (!from || b.startDate >= from) && (!to || b.startDate <= to));
  const received = bookings.reduce((sum, b) => sum + (b.securityDeposit ? b.securityDeposit.amount : 0), 0);
  const refunded = bookings.reduce((sum, b) => sum + (b.depositRefund ? b.depositRefund.refundAmount : 0), 0);
  const held = bookings.reduce((sum, b) => sum + (b.securityDeposit && !b.depositRefund ? b.securityDeposit.amount : 0), 0);
  const pending = bookings
    .filter((b) => !b.securityDeposit && (b.status === 'Confirmed' || b.status === 'Active'))
    .reduce((sum, b) => sum + (loadCars().find((c) => c.id === b.vehicleId)?.securityDeposit || 0), 0);

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
        rows.push([b.bookingNumber, b.customerName, PAYMENT_TYPE_LABELS[p.type], p.amount, formatDate(p.date), p.method, p.reference || '—']);
      });
  });
  rows.sort((a, b) => (a[4] < b[4] ? 1 : -1));

  return {
    title: 'Payment Report',
    headers: ['Booking #', 'Customer', 'Type', 'Amount (₹)', 'Date', 'Method', 'Reference'],
    rows,
  };
}

function renderReport() {
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
