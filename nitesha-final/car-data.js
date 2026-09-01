// Shared car-listing store used by both index.html (public site) and admin.html.
// Persists to localStorage so admin edits show up on the public grid in this
// same browser. NOTE: this is client-side only — a real deployment needs a
// backend (PHP/MySQL on Hostinger, or similar) for edits to be visible to
// other visitors. See README for details.

const CAR_STORE_KEY = 'nitesha_cars_v1';
const INQUIRY_STORE_KEY = 'nitesha_inquiries_v1';

// Vehicle statuses used across admin (Vehicles tab, Bookings, Reports).
const VEHICLE_STATUSES = ['Available', 'Booked', 'On Rental', 'Maintenance', 'Inactive'];
const CAR_BODY_TYPES = ['Hatchback', 'Sedan', 'SUV'];

const DEFAULT_CARS = [
  { id: 1, brand: 'Suzuki', name: 'Fronx — Brand New 2026', fuel: 'Petrol', transmission: 'Manual', seats: 5, year: 2026, price: 3500, bodyType: 'SUV', color: '#5B6472',
    regNumber: 'KA05AB1234', price7: 22000, price15: 42000, price30: 78000, kmLimitPerDay: 200, extraKmRate: 10, securityDeposit: 5000, currentKm: 4200, status: 'Available' },
  { id: 2, brand: 'Kia', name: 'Carens — 7 Seater', fuel: 'Diesel', transmission: 'Manual', seats: 7, year: 2026, price: 4500, bodyType: 'SUV', color: '#2C4C8C',
    regNumber: 'KA05AB2345', price7: 28000, price15: 54000, price30: 100000, kmLimitPerDay: 200, extraKmRate: 12, securityDeposit: 7000, currentKm: 3100, status: 'Available' },
  { id: 3, brand: 'Suzuki', name: 'Swift — Automatic', fuel: 'Petrol', transmission: 'Automatic', seats: 5, year: 2025, price: 3000, bodyType: 'Hatchback', color: '#D6473C',
    regNumber: 'KA05AB3456', price7: 19000, price15: 36000, price30: 66000, kmLimitPerDay: 200, extraKmRate: 10, securityDeposit: 5000, currentKm: 8900, status: 'Available' },
  { id: 4, brand: 'Suzuki', name: 'Wagon R — AT 2025', fuel: 'Petrol', transmission: 'Automatic', seats: 5, year: 2025, price: 2500, bodyType: 'Hatchback', color: '#E8A23A',
    regNumber: 'KA05AB4567', price7: 16000, price15: 30000, price30: 55000, kmLimitPerDay: 200, extraKmRate: 8, securityDeposit: 4000, currentKm: 12400, status: 'Available' },
  { id: 5, brand: 'Kia', name: 'Seltos — GT Line', fuel: 'Petrol', transmission: 'Automatic', seats: 5, year: 2021, price: 4000, bodyType: 'SUV', color: '#3E8E5B',
    regNumber: 'KA05AB5678', price7: 25000, price15: 48000, price30: 88000, kmLimitPerDay: 200, extraKmRate: 12, securityDeposit: 6000, currentKm: 31200, status: 'Available' },
  { id: 6, brand: 'Suzuki', name: 'Alto K10 — 2025', fuel: 'Petrol', transmission: 'Manual', seats: 5, year: 2025, price: 2000, bodyType: 'Hatchback', color: '#7C8794',
    regNumber: 'KA05AB6789', price7: 13000, price15: 24000, price30: 44000, kmLimitPerDay: 200, extraKmRate: 8, securityDeposit: 3000, currentKm: 6700, status: 'Available' },
];

// Fills in defaults for vehicle fields added after a browser's localStorage
// data was first created, so older saved records don't break new UI/calcs.
function normalizeCar(car) {
  return {
    regNumber: '',
    price7: 0,
    price15: 0,
    price30: 0,
    kmLimitPerDay: 200,
    extraKmRate: 0,
    securityDeposit: 0,
    currentKm: 0,
    status: 'Available',
    bodyType: 'Hatchback',
    color: '#5B6472',
    ...car,
  };
}

function loadCars() {
  try {
    const raw = localStorage.getItem(CAR_STORE_KEY);
    if (!raw) return DEFAULT_CARS.slice();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed.map(normalizeCar) : DEFAULT_CARS.slice();
  } catch {
    return DEFAULT_CARS.slice();
  }
}

function saveCars(cars) {
  localStorage.setItem(CAR_STORE_KEY, JSON.stringify(cars));
}

function nextCarId(cars) {
  return cars.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

function loadInquiries() {
  try {
    const raw = localStorage.getItem(INQUIRY_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveInquiry(inquiry) {
  const inquiries = loadInquiries();
  inquiries.unshift({ ...inquiry, id: Date.now(), receivedAt: new Date().toISOString() });
  localStorage.setItem(INQUIRY_STORE_KEY, JSON.stringify(inquiries));
}

// ---- Vehicle illustrations & small icons ----
// Clean vector side-profile illustrations, in place of emoji. COLOR is
// substituted with the vehicle's own paint color per card.
const CAR_SVG_TEMPLATES = {
  Hatchback: `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hatchback illustration">
    <ellipse cx="104" cy="103" rx="76" ry="8" fill="#000" opacity="0.08"/>
    <path d="M26,95 C24,80 28,72 40,70 L48,68 C54,52 68,40 88,38 L114,38 C126,38 134,44 138,54 L142,68 L166,70 C176,71 180,78 180,86 L180,95 Z" fill="COLOR" stroke="#00000022" stroke-width="1"/>
    <path d="M54,66 C60,52 70,42 88,40 L112,40 C122,40 128,45 131,53 L134,66 Z" fill="#BFE3F7" opacity="0.9"/>
    <line x1="98" y1="41" x2="94" y2="66" stroke="#7fa8c9" stroke-width="2"/>
    <path d="M138,54 L142,68 L166,70" fill="none" stroke="#00000022" stroke-width="1"/>
    <circle cx="64" cy="97" r="16" fill="#1c1f26"/><circle cx="64" cy="97" r="7" fill="#c7ccd6"/>
    <circle cx="152" cy="97" r="16" fill="#1c1f26"/><circle cx="152" cy="97" r="7" fill="#c7ccd6"/>
    <rect x="28" y="80" width="10" height="5" rx="2" fill="#fff2ae"/>
    <rect x="172" y="80" width="8" height="5" rx="2" fill="#ff9d9d"/>
  </svg>`,
  Sedan: `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sedan illustration">
    <ellipse cx="112" cy="103" rx="98" ry="8" fill="#000" opacity="0.08"/>
    <path d="M12,95 C10,82 14,74 26,72 L38,70 C44,56 56,44 74,40 L94,38 C106,37 114,40 120,48 L127,57 C140,57 150,58 158,61 L164,68 L198,72 C207,73 211,79 211,87 L211,95 Z" fill="COLOR" stroke="#00000022" stroke-width="1"/>
    <path d="M46,68 C52,56 62,46 76,42 L92,40 C102,39 108,42 113,49 L119,57 L146,58 C142,61 134,63 126,63 L58,63 Z" fill="#BFE3F7" opacity="0.9"/>
    <line x1="97" y1="41" x2="93" y2="63" stroke="#7fa8c9" stroke-width="2"/>
    <path d="M158,61 L164,68 L198,72" fill="none" stroke="#00000022" stroke-width="1"/>
    <circle cx="60" cy="97" r="16" fill="#1c1f26"/><circle cx="60" cy="97" r="7" fill="#c7ccd6"/>
    <circle cx="178" cy="97" r="16" fill="#1c1f26"/><circle cx="178" cy="97" r="7" fill="#c7ccd6"/>
    <rect x="14" y="80" width="10" height="5" rx="2" fill="#fff2ae"/>
    <rect x="203" y="82" width="8" height="5" rx="2" fill="#ff9d9d"/>
  </svg>`,
  SUV: `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SUV illustration">
    <ellipse cx="110" cy="106" rx="92" ry="8" fill="#000" opacity="0.08"/>
    <path d="M16,98 C13,80 19,68 33,66 L40,65 L44,42 C45,34 50,29 58,29 L160,29 C168,29 173,34 174,42 L177,65 L192,66 C203,67 207,77 207,88 L207,98 Z" fill="COLOR" stroke="#00000022" stroke-width="1"/>
    <path d="M50,63 L54,42 C55,37 58,34 63,34 L155,34 C160,34 163,37 164,42 L167,63 Z" fill="#BFE3F7" opacity="0.9"/>
    <line x1="110" y1="34" x2="108" y2="63" stroke="#7fa8c9" stroke-width="2"/>
    <rect x="16" y="80" width="191" height="7" fill="#00000014"/>
    <circle cx="63" cy="100" r="19" fill="#1c1f26"/><circle cx="63" cy="100" r="8.5" fill="#c7ccd6"/>
    <circle cx="174" cy="100" r="19" fill="#1c1f26"/><circle cx="174" cy="100" r="8.5" fill="#c7ccd6"/>
    <rect x="18" y="78" width="11" height="5" rx="2" fill="#fff2ae"/>
    <rect x="198" y="78" width="9" height="5" rx="2" fill="#ff9d9d"/>
  </svg>`,
};

function carIllustrationSVG(bodyType, color) {
  const template = CAR_SVG_TEMPLATES[bodyType] || CAR_SVG_TEMPLATES.Hatchback;
  return template.split('COLOR').join(color || '#5B6472');
}

const ICON_GEAR = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>';
const ICON_SEATS = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
const ICON_CALENDAR = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>';

// ---- Public-site rendering ----
function carCardHTML(car) {
  return `
    <article class="car-card" data-car-id="${car.id}">
      <div class="car-img-box">
        <span class="badge badge-brand">${car.brand}</span>
        <span class="badge badge-fuel">${car.fuel}</span>
        <div class="car-illustration">${carIllustrationSVG(car.bodyType, car.color)}</div>
      </div>
      <div class="car-body">
        <h3 class="car-name">${car.name}</h3>
        <div class="car-meta">
          <span>${ICON_GEAR} ${car.transmission}</span>
          <span>${ICON_SEATS} ${car.seats} Seats</span>
          <span>${ICON_CALENDAR} ${car.year}</span>
        </div>
        <div class="car-footer">
          <div><span class="price">₹${car.price.toLocaleString('en-IN')}</span><span class="per">/day</span></div>
          <a href="#contact" class="btn btn-primary btn-sm">Book Now</a>
        </div>
      </div>
    </article>`;
}

function renderCarGrid() {
  const grid = document.getElementById('carGrid');
  if (!grid) return;
  const cars = loadCars().filter((c) => c.status === 'Available');
  grid.innerHTML = cars.length
    ? cars.map(carCardHTML).join('')
    : '<p style="color:#98a2b3">No cars currently available — check back soon.</p>';
}
