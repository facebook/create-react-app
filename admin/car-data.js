// Vehicle and enquiry store for the admin panel.
// NOTE: this is client-side only — records live in one browser's localStorage,
// so they are not shared between devices and anyone can read them. Replacing
// this with a real backend is the next piece of work; see README.

// Vehicles live in the database. They are fetched once per page load and
// cached here, so the many places that call loadCars() keep working unchanged
// while the source of truth stays on the server.
//
// The API speaks snake_case and keeps rates in a dated rate card; the panel
// was written against a flat camelCase shape. toPanelShape() bridges the two
// so neither side has to be rewritten to match the other.

const VEHICLE_STATUSES = ['Available', 'Booked', 'On Rental', 'Maintenance', 'Inactive'];
const CAR_BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Other'];

let VEHICLE_CACHE = [];

function toPanelShape(v) {
  return {
    id: v.id,
    brand: v.brand,
    name: v.name,
    regNumber: v.reg_number,
    bodyType: v.body_type,
    fuel: v.fuel,
    transmission: v.transmission,
    seats: v.seats,
    year: v.model_year,
    color: v.colour,
    status: v.status,
    // Whose car it is. 'own' on a database that has not run the migration yet,
    // which is what every car was before the column existed.
    ownership: v.ownership || 'own',
    ownerName: v.owner_name || '',
    ownerPhone: v.owner_phone || '',
    isTemporary: Boolean(v.is_temporary),
    // The loan on this car, flattened so the form reads one field per box.
    // Null when there is none, and null on a database that has not run the
    // migration yet -- which reads the same as "no loan", correctly.
    purchase_date: v.purchase_date || '',
    insurance_expiry: v.insurance_expiry || '',
    pollution_expiry: v.pollution_expiry || '',
    fitness_expiry: v.fitness_expiry || '',
    service_due_km: v.service_due_km ?? '',
    service_due_on: v.service_due_on || '',
    gps_provider: v.gps_provider || '',
    gps_device_id: v.gps_device_id || '',
    gps_url: v.gps_url || '',
    currentKm: v.current_km,
    price: v.rate_daily,
    // Blank rather than 0: empty means "one price", and 0 would advertise
    // a range topping out at nothing.
    priceMax: v.rate_daily_max ?? '',
    price7: v.rate_7day || 0,
    price15: v.rate_15day || 0,
    price30: v.rate_30day || 0,
    kmLimitPerDay: v.km_limit_per_day,
    extraKmRate: v.extra_km_rate,
    securityDeposit: v.security_deposit,
    // Read-only here. Photographs are uploaded through their own endpoint,
    // because saving a vehicle sends JSON and a file cannot travel in it.
    photo: v.photo || null,
  };
}

function toApiShape(car) {
  return {
    id: car.id || '',
    name: car.name,
    brand: car.brand,
    reg_number: car.regNumber,
    body_type: car.bodyType,
    fuel: car.fuel,
    transmission: car.transmission,
    seats: car.seats,
    model_year: car.year,
    colour: car.color,
    status: car.status,
    ownership: car.ownership || 'own',
    owner_name: car.ownerName || '',
    owner_phone: car.ownerPhone || '',
    owner_phone_code: car.ownerPhoneCode || '+91',
    is_temporary: car.isTemporary ? 1 : 0,
    purchase_date: car.purchase_date || '',
    insurance_expiry: car.insurance_expiry || '',
    pollution_expiry: car.pollution_expiry || '',
    fitness_expiry: car.fitness_expiry || '',
    service_due_km: car.service_due_km || '',
    service_due_on: car.service_due_on || '',
    gps_provider: car.gps_provider || '',
    gps_device_id: car.gps_device_id || '',
    gps_url: car.gps_url || '',
    current_km: car.currentKm,
    rate_daily: car.price,
    rate_daily_max: car.priceMax === '' || car.priceMax === null ? '' : car.priceMax,
    rate_7day: car.price7 || '',
    rate_15day: car.price15 || '',
    rate_30day: car.price30 || '',
    km_limit_per_day: car.kmLimitPerDay,
    extra_km_rate: car.extraKmRate,
    security_deposit: car.securityDeposit,
  };
}

/** Re-reads the fleet from the server. Call after any change. */
async function refreshVehicles(includeInactive = false) {
  const data = await api.vehicles.list(includeInactive);
  VEHICLE_CACHE = data.vehicles.map(toPanelShape);
  return VEHICLE_CACHE;
}

/** Synchronous read of the cached fleet, for the existing render code. */
function loadCars() {
  return VEHICLE_CACHE.slice();
}

async function saveVehicle(car) {
  const result = await api.vehicles.save(toApiShape(car));
  await refreshVehicles();
  return result.vehicle;
}

/**
 * Uploads or removes a vehicle's photograph.
 *
 * Kept apart from saveVehicle because it needs a vehicle id, and a vehicle
 * being created does not have one until the save returns. The form does both
 * in order so that is invisible to whoever is filling it in.
 */
async function saveVehiclePhoto(vehicleId, file) {
  await api.vehicles.photo(vehicleId, file);
  await refreshVehicles();
}

/**
 * Changes a few fields on a vehicle and saves it. Used by the pickup and
 * return flows, which move a vehicle between statuses and write back the
 * odometer reading taken at handover.
 */
async function updateVehicleFields(id, changes) {
  const car = VEHICLE_CACHE.find((c) => c.id === id);
  if (!car) return null;
  return saveVehicle({ ...car, ...changes });
}

async function retireVehicle(id, reason) {
  await api.vehicles.retire(id, reason);
  await refreshVehicles();
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
