// Thin wrapper over fetch for the admin panel.
//
// Every state-changing request carries the CSRF token the server put in the
// page, and every response is checked before the caller sees it — so a
// failure surfaces as a thrown error with the server's message rather than
// silently leaving the screen showing stale data.

const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]')?.content || '';

class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || {};
  }
}

async function apiRequest(url, { method = 'GET', body = null } = {}) {
  const options = {
    method,
    headers: { 'Accept': 'application/json' },
    credentials: 'same-origin',
  };

  if (body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['X-CSRF-Token'] = CSRF_TOKEN;
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  // The session ending mid-use is common enough to handle specifically:
  // send the user back to sign in rather than showing a confusing error.
  if (response.status === 401) {
    window.location.href = 'index.php';
    throw new ApiError('Signed out', 401);
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('The server returned an unreadable response.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(payload.error || 'Something went wrong.', response.status, payload.fields);
  }
  return payload;
}

/**
 * The same handling as apiRequest, for a request carrying a file.
 *
 * apiRequest sets Content-Type and JSON-encodes the body, and both are wrong
 * for an upload: the browser has to set the multipart boundary itself, so the
 * header must be left alone entirely.
 */
async function apiUpload(url, formData) {
  formData.append('csrf_token', CSRF_TOKEN);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'X-CSRF-Token': CSRF_TOKEN },
      credentials: 'same-origin',
      body: formData,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  if (response.status === 401) {
    window.location.href = 'index.php';
    throw new ApiError('Signed out', 401);
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // An upload larger than the server accepts is often refused before PHP
    // runs, so the reply is the host's HTML error page rather than our JSON.
    throw new ApiError(
      response.status === 413
        ? 'That image is larger than the server will accept. Try one under about 5 MB.'
        : 'The server returned an unreadable response.',
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(payload.error || 'Something went wrong.', response.status, payload.fields);
  }
  return payload;
}

const api = {
  vehicles: {
    list: (includeInactive = false) =>
      apiRequest(`api/vehicles.php?action=list${includeInactive ? '&include_inactive=1' : ''}`),
    save: (vehicle) =>
      apiRequest('api/vehicles.php?action=save', { method: 'POST', body: vehicle }),
    retire: (id, reason) =>
      apiRequest('api/vehicles.php?action=retire', { method: 'POST', body: { id, reason } }),
    photo: (id, file) => {
      const form = new FormData();
      form.append('vehicle_id', String(id));
      if (file) {
        form.append('photo', file);
      } else {
        form.append('remove', '1');
      }
      return apiUpload('api/vehicle-photo.php', form);
    },
  },

  bookings: {
    list: (status = '') =>
      apiRequest(`api/bookings.php?action=list${status ? '&status=' + encodeURIComponent(status) : ''}`),
    get: (id) => apiRequest(`api/bookings.php?action=get&id=${id}`),
    save: (booking) =>
      apiRequest('api/bookings.php?action=save', { method: 'POST', body: booking }),
    cancel: (id, reason, cancelledBy = 'admin', cancellationFee = '') =>
      apiRequest('api/bookings.php?action=cancel', {
        method: 'POST',
        body: { id, reason, cancelled_by: cancelledBy, cancellation_fee: cancellationFee || '0' },
      }),
    complete: (id) =>
      apiRequest('api/bookings.php?action=complete', { method: 'POST', body: { id } }),
    // Cancelled bookings only, and only once no money is attached. The
    // endpoint enforces both; this is here so the panel can offer it.
    remove: (id) =>
      apiRequest('api/bookings.php?action=delete', { method: 'POST', body: { id } }),
  },

  // Screenshots and photographs hanging off a booking. Multipart, so it goes
  // through apiUpload rather than apiRequest -- and several files in one
  // request, because the pickup and return boxes take several and five round
  // trips over a phone connection is how some of them go missing.
  bookingFiles: {
    add: (bookingId, kind, files, refId = null) => {
      const form = new FormData();
      form.append('booking_id', String(bookingId));
      form.append('kind', kind);
      if (refId !== null) form.append('ref_id', String(refId));
      for (const file of files) form.append('files[]', file);
      return apiUpload('api/booking-files.php?action=add', form);
    },
    remove: (id) =>
      apiRequest('api/booking-files.php?action=delete', { method: 'POST', body: { id } }),
  },

  // Charges raised after a booking was priced, and the damage behind them.
  extras: {
    add: (extra) =>
      apiRequest('api/booking-extras.php?action=add-extra', { method: 'POST', body: extra }),
    void: (id, reason) =>
      apiRequest('api/booking-extras.php?action=void-extra', { method: 'POST', body: { id, reason } }),
    edit: (extra) =>
      apiRequest('api/booking-extras.php?action=edit-extra', { method: 'POST', body: extra }),
    addDamage: (damage) =>
      apiRequest('api/booking-extras.php?action=add-damage', { method: 'POST', body: damage }),
    editDamage: (damage) =>
      apiRequest('api/booking-extras.php?action=edit-damage', { method: 'POST', body: damage }),
    voidDamage: (id) =>
      apiRequest('api/booking-extras.php?action=void-damage', { method: 'POST', body: { id } }),
  },

  // A customer's identity documents. Multipart, and one file at a time --
  // these are picked deliberately, one per kind, not dragged in as a batch.
  customerFiles: {
    list: (customerId) =>
      apiRequest(`api/customer-files.php?action=list&customer_id=${customerId}`),
    add: (customerId, kind, file, expiresOn = '') => {
      const form = new FormData();
      form.append('customer_id', String(customerId));
      form.append('kind', kind);
      if (expiresOn) form.append('expires_on', expiresOn);
      form.append('file', file);
      return apiUpload('api/customer-files.php?action=add', form);
    },
    // What it is and when it runs out. The file itself is never swapped --
    // that is a removal and a fresh upload.
    edit: (id, kind, caption, expiresOn) =>
      apiRequest('api/customer-files.php?action=edit', {
        method: 'POST', body: { id, kind, caption, expires_on: expiresOn },
      }),
    remove: (id) =>
      apiRequest('api/customer-files.php?action=delete', { method: 'POST', body: { id } }),
  },

  // What needs doing today, worked out on the server because it has to look
  // at every booking's money and every vehicle's papers to know.
  alerts: {
    today: () => apiRequest('api/alerts.php'),
  },

  // One box, everything. The server decides what matches; this only asks.
  search: (q) => apiRequest(`api/search.php?q=${encodeURIComponent(q)}`),

  reminders: {
    list: () => apiRequest('api/reminders.php?action=list'),
    save: (reminder) =>
      apiRequest('api/reminders.php?action=save', { method: 'POST', body: reminder }),
    done: (id) => apiRequest('api/reminders.php?action=done', { method: 'POST', body: { id } }),
    reopen: (id) => apiRequest('api/reminders.php?action=reopen', { method: 'POST', body: { id } }),
    remove: (id) => apiRequest('api/reminders.php?action=delete', { method: 'POST', body: { id } }),
  },

  services: {
    list: (vehicleId) => apiRequest(`api/vehicle-services.php?action=list&vehicle_id=${vehicleId}`),
    add: (service) =>
      apiRequest('api/vehicle-services.php?action=add', { method: 'POST', body: service }),
    void: (id) =>
      apiRequest('api/vehicle-services.php?action=void', { method: 'POST', body: { id } }),
  },

  customers: {
    lookup: (phone) =>
      apiRequest(`api/customers.php?action=lookup&phone=${encodeURIComponent(phone)}`),
  },

  payments: {
    add: (payment) =>
      apiRequest('api/payments.php?action=add', { method: 'POST', body: payment }),
    void: (id, reason) =>
      apiRequest('api/payments.php?action=void', { method: 'POST', body: { id, reason } }),
    correct: (correction) =>
      apiRequest('api/payments.php?action=correct', { method: 'POST', body: correction }),
    deposit: (deposit) =>
      apiRequest('api/payments.php?action=deposit', { method: 'POST', body: deposit }),
    // Corrections supersede: the wrong row is kept and marked, the right one
    // replaces it. See the note at the top of api/payments.php.
    correctDeposit: (correction) =>
      apiRequest('api/payments.php?action=deposit-correct', { method: 'POST', body: correction }),
    refund: (refund) =>
      apiRequest('api/payments.php?action=refund', { method: 'POST', body: refund }),
    correctRefund: (correction) =>
      apiRequest('api/payments.php?action=refund-correct', { method: 'POST', body: correction }),
  },

  enquiries: {
    list: (status = '', q = '') => {
      const params = new URLSearchParams({ action: 'list' });
      if (status) params.set('status', status);
      if (q) params.set('q', q);
      return apiRequest(`api/enquiries.php?${params}`);
    },
    get: (id) => apiRequest(`api/enquiries.php?action=get&id=${id}`),
    status: (id, status, note) =>
      apiRequest('api/enquiries.php?action=status', { method: 'POST', body: { id, status, note } }),
    note: (id, note) =>
      apiRequest('api/enquiries.php?action=note', { method: 'POST', body: { id, note } }),
    edit: (payload) =>
      apiRequest('api/enquiries.php?action=edit', { method: 'POST', body: payload }),
    remove: (id) =>
      apiRequest('api/enquiries.php?action=delete', { method: 'POST', body: { id } }),
    convert: (payload) =>
      apiRequest('api/enquiries.php?action=convert', { method: 'POST', body: payload }),
  },

  expenses: {
    list: ({ from, to, category, vehicleId, includeVoided } = {}) => {
      const params = new URLSearchParams({ action: 'list' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (category) params.set('category', category);
      if (vehicleId) params.set('vehicle_id', vehicleId);
      if (includeVoided) params.set('include_voided', '1');
      return apiRequest(`api/expenses.php?${params}`);
    },
    summary: ({ from, to } = {}) => {
      const params = new URLSearchParams({ action: 'summary' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      return apiRequest(`api/expenses.php?${params}`);
    },
    save: (expense) => apiRequest('api/expenses.php?action=save', { method: 'POST', body: expense }),
    void: (id, reason) =>
      apiRequest('api/expenses.php?action=void', { method: 'POST', body: { id, reason } }),
    correct: (correction) =>
      apiRequest('api/expenses.php?action=correct', { method: 'POST', body: correction }),
    approve: (id, state, reason) =>
      apiRequest('api/expenses.php?action=approve', { method: 'POST', body: { id, state, reason } }),
  },

  km: {
    pickup: (record) => apiRequest('api/km.php?action=pickup', { method: 'POST', body: record }),
    return: (record) => apiRequest('api/km.php?action=return', { method: 'POST', body: record }),
    correct: (correction) =>
      apiRequest('api/km.php?action=correct', { method: 'POST', body: correction }),
  },
};
