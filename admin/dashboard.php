<?php
declare(strict_types=1);

require_once __DIR__ . '/src/icons.php';

require_once __DIR__ . '/src/csrf.php';
require_once __DIR__ . '/src/assets.php';
require_once __DIR__ . '/src/vocab.php';
require_once __DIR__ . '/src/booking.php';
require_once __DIR__ . '/src/migrate.php';
require_once __DIR__ . '/src/shell.php';
require_once __DIR__ . '/src/business.php';
require_once __DIR__ . '/src/phone.php';
/** The country-code select that sits in front of a phone input. */
function dial_select(string $id, string $selected = DIAL_DEFAULT): string
{
    $out = '<select class="dial-code" id="' . e($id) . '" aria-label="Country code">';
    foreach (DIAL_CODES as $entry) {
        $on = $entry['code'] === $selected ? ' selected' : '';
        $out .= '<option value="' . e($entry['code']) . '"' . $on . '>'
             . e($entry['code']) . ' ' . e($entry['name']) . '</option>';
    }
    return $out . '</select>';
}

// Anyone reaching this page must already be signed in; require_login sends
// them to the sign-in form otherwise.
$me = require_login();

// Apply any migration that has not run yet.
//
// api_guard does this too, so by the time anything is saved the schema is
// current whatever route was taken. Here as well because this is the page that
// can show a failure, rather than turning it into a failed API call.
$migrationError = migrate_if_needed();

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

admin_shell_open($me, 'dashboard', 'Dashboard', true, $migrationError);
?>

      <!-- Dashboard tab -->
      <section class="admin-panel" id="panel-dashboard">
        <div class="panel-header">
          <div>
            <h2>Overview</h2>
            <p>A snapshot of your fleet, inquiries, and finances.</p>
          </div>
        </div>

        <!-- One box that finds anything: a booking number, a registration, a
             phone number, a name. Which tab a thing lives under is not
             something anyone should have to work out before they can look for
             it. -->
        <div class="search-wrap">
          <input type="search" id="globalSearch" class="search-box"
                 aria-label="Search bookings, vehicles and customers"
                 placeholder="Search a booking number, registration, phone or name…"
                 autocomplete="off" />
          <div class="search-results" id="searchResults" hidden></div>
        </div>

        <!-- The six things started most often. Every one of them was three
             clicks through the sidebar. -->
        <div class="quick-actions">
          <button class="btn btn-primary btn-sm" data-quick="booking">+ New booking</button>
          <button class="btn btn-outline btn-sm" data-quick="vehicle">+ Add vehicle</button>
          <button class="btn btn-outline btn-sm" data-quick="expense">+ Add expense</button>
          <button class="btn btn-outline btn-sm" data-quick="inquiries">Inquiries</button>
          <button class="btn btn-outline btn-sm" data-quick="bookings">All bookings</button>
          <button class="btn btn-outline btn-sm" data-quick="finance">Finance</button>
        </div>

        <!-- Everything below the search splits into two columns that each
             scroll on their own, so the overview is one screen however many
             alerts there are. It was a single narrow column of ten stacked
             sections, which on a wide monitor ran to twice the height of the
             screen with half the width unused. Counts on the left, because
             they are a fixed block you scan; what needs doing on the right,
             because it is the part that grows. -->
        <div class="dash-body">
        <div class="dash-col-main">

        <!-- The shape of the day, before any of the totals. Three pickups is
             not a problem, it is a morning -- which is why these sit apart
             from "Needs attention". -->
        <section class="today-ops" id="todayOps" hidden>
          <h3 class="dashboard-subheading">Today</h3>
          <div class="ops-grid">
            <div class="ops-card"><span class="ops-value" id="opsPickups">0</span><span class="ops-label">Pickups</span></div>
            <div class="ops-card"><span class="ops-value" id="opsReturns">0</span><span class="ops-label">Returns</span></div>
            <div class="ops-card"><span class="ops-value" id="opsPayments">₹0</span><span class="ops-label">Payments due</span></div>
            <div class="ops-card"><span class="ops-value" id="opsDeposits">₹0</span><span class="ops-label">Deposits to refund</span></div>
            <div class="ops-card"><span class="ops-value" id="opsServicing">0</span><span class="ops-label">In service</span></div>
            <div class="ops-card"><span class="ops-value" id="opsEnquiries">0</span><span class="ops-label">New inquiries</span></div>
            <div class="ops-card"><span class="ops-value" id="opsReminders">0</span><span class="ops-label">Reminders</span></div>
          </div>
        </section>

        <div class="stat-grid">
          <div class="stat-card">
            <?= admin_icon3d('car', 34) ?>
            <span class="stat-label">Cars Listed</span>
            <span class="stat-value" id="statCarCount">0</span>
          </div>
          <div class="stat-card">
            <?= admin_icon3d('inbox', 34) ?>
            <span class="stat-label">Booking Inquiries</span>
            <span class="stat-value" id="statInquiryCount">0</span>
          </div>
          <div class="stat-card stat-card-income">
            <?= admin_icon3d('rupee', 34) ?>
            <span class="stat-label">Total Income</span>
            <span class="stat-value" id="statIncome">₹0</span>
          </div>
          <div class="stat-card stat-card-expense">
            <?= admin_icon3d('wallet', 34) ?>
            <span class="stat-label">Total Expenses</span>
            <span class="stat-value" id="statExpense">₹0</span>
          </div>
          <div class="stat-card stat-card-balance">
            <?= admin_icon3d('scales', 34) ?>
            <span class="stat-label">Net Balance</span>
            <span class="stat-value" id="statBalance">₹0</span>
          </div>
        </div>

        <div class="dashboard-cols">
          <div class="dashboard-col">
            <h3>Recent Inquiries</h3>
            <div id="recentInquiries"></div>
          </div>
          <div class="dashboard-col">
            <h3>Recent Transactions</h3>
            <div id="recentTransactions"></div>
          </div>
        </div>

        <h3 class="dashboard-subheading">Rental Overview</h3>
        <div class="stat-grid stat-grid-4" id="rentalStatGrid">
          <div class="stat-card"><span class="stat-label">Today's Bookings</span><span class="stat-value" id="statTodayBookings">0</span></div>
          <div class="stat-card"><span class="stat-label">Active Rentals</span><span class="stat-value" id="statActiveRentals">0</span></div>
          <div class="stat-card"><span class="stat-label">Upcoming Bookings</span><span class="stat-value" id="statUpcomingBookings">0</span></div>
          <div class="stat-card stat-card-income"><span class="stat-label">Total Rental Revenue</span><span class="stat-value" id="statRentalRevenue">₹0</span></div>
          <div class="stat-card stat-card-income"><span class="stat-label">Advance Received</span><span class="stat-value" id="statAdvanceReceived">₹0</span></div>
          <div class="stat-card stat-card-expense"><span class="stat-label">Pending Balance</span><span class="stat-value" id="statPendingBalance">₹0</span></div>
          <div class="stat-card"><span class="stat-label">Commission Earned</span><span class="stat-value" id="statCommission">₹0</span></div>
          <div class="stat-card"><span class="stat-label">Payable to Car Owners</span><span class="stat-value" id="statOwnerPayable">₹0</span></div>
          <div class="stat-card stat-card-deposit"><span class="stat-label">Security Deposit Held</span><span class="stat-value" id="statDepositHeld">₹0</span></div>
          <div class="stat-card stat-card-deposit"><span class="stat-label">Security Deposit Refunded</span><span class="stat-value" id="statDepositRefunded">₹0</span></div>
          <div class="stat-card stat-card-income"><span class="stat-label">Extra KM Revenue</span><span class="stat-value" id="statExtraKmRevenue">₹0</span></div>
          <div class="stat-card"><span class="stat-label">Total KM Driven</span><span class="stat-value" id="statTotalKm">0</span></div>
          <div class="stat-card stat-card-expense"><span class="stat-label">Total Expenses</span><span class="stat-value" id="statTotalExpenses">₹0</span></div>
          <div class="stat-card stat-card-balance"><span class="stat-label">Net Revenue</span><span class="stat-value" id="statNetRevenue">₹0</span></div>
        </div>

        </div><!-- /dash-col-main -->

        <div class="dash-col-side">
          <!-- What needs doing, above the figures.
               A number tells you where the business stands; these tell you
               what is about to go wrong, and only one of the two has a
               deadline. -->
          <section class="alerts" id="alertsPanel" hidden>
            <h3 class="dashboard-subheading">Needs attention</h3>
            <ul class="alert-list" id="alertList"></ul>
          </section>

          <div class="dashboard-col">
            <h3>Active &amp; Upcoming Rentals</h3>
            <div id="activeUpcomingBookings"></div>
          </div>
        </div><!-- /dash-col-side -->
        </div><!-- /dash-body -->
      </section>

      <!-- Bookings tab -->
      <section class="admin-panel" id="panel-bookings" hidden>
        <div id="bookingListView">
          <div class="panel-header">
            <div>
              <h2>Bookings / Rental Management</h2>
              <p>Create and manage rental bookings, payments, deposits, and vehicle pickup/return.</p>
            </div>
            <button class="btn btn-primary" id="addBookingBtn">+ New Booking</button>
          </div>

          <!-- Counts, filters and the table are all drawn from the same list,
               so a chip and the number above it can never disagree. -->
          <div class="rec-stats" id="bookingStats"></div>

          <div class="rec-chipbar">
            <div class="rec-chips" id="bookingChips"></div>
          </div>

          <div class="rec-toolbar">
            <div class="rec-search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              <input type="search" id="bookingSearch" aria-label="Search bookings"
                     placeholder="Search by number, customer or vehicle" />
            </div>
            <button type="button" class="rec-icon-btn" id="bookingReset"
                    title="Clear the search and filters" aria-label="Clear the search and filters">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" stroke="currentColor"
                      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div id="bookingListWrap"></div>
          <div class="rec-pager" id="bookingPager" hidden></div>
        </div>

        <div id="bookingDetailView" hidden></div>
      </section>

      <!-- Vehicles tab -->
      <section class="admin-panel" id="panel-cars" hidden>
        <div class="panel-header">
          <div>
            <h2>Vehicle Management</h2>
            <p>Fleet, rates, KM limits, and status. An available car with a rate shows on
              the public site too &mdash; unless it is marked temporary, which keeps it here only.</p>
          </div>
          <button class="btn btn-primary" id="addCarBtn">+ Add Vehicle</button>
        </div>

        <div class="car-admin-grid" id="carAdminGrid"></div>
      </section>

      <!-- Inquiries tab -->
      <section class="admin-panel" id="panel-inquiries" hidden>
        <div id="inquiryListView">
          <div class="panel-header">
            <div>
              <h2>Booking Inquiries</h2>
              <p>Enquiries submitted from niteshacars.in. Accepting one creates a booking.</p>
            </div>
          </div>

          <div class="rec-stats" id="enquiryStats"></div>

          <div class="rec-chipbar">
            <div class="rec-chips" id="enquiryChips"></div>
          </div>

          <div class="rec-toolbar">
            <div class="rec-search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              <!-- A placeholder is not a label: it vanishes the moment anyone
                   types, and a screen reader is not obliged to announce it. -->
              <input type="search" id="enquirySearch" aria-label="Search enquiries"
                     placeholder="Search name, phone or ENQ number" />
            </div>
            <button type="button" class="rec-icon-btn" id="enquiryReset"
                    title="Clear the search and filters" aria-label="Clear the search and filters">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" stroke="currentColor"
                      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div id="inquiriesWrap"></div>
          <div class="rec-pager" id="enquiryPager" hidden></div>
        </div>

        <div id="enquiryDetailView" hidden></div>
      </section>

      <!-- Finance tab -->
      <section class="admin-panel" id="panel-finance" hidden>
        <div class="panel-header">
          <div>
            <h2>Finance &amp; Accounts</h2>
            <p>Income is taken from the payments recorded against bookings. Expenses are recorded here.</p>
          </div>
          <button class="btn btn-primary" id="addExpenseBtn">Record Expense</button>
        </div>

        <div class="finance-range">
          <label for="finFrom">From</label>
          <input type="date" id="finFrom">
          <label for="finTo">To</label>
          <input type="date" id="finTo">
          <button class="btn btn-ghost" id="finThisMonth">This month</button>
          <button class="btn btn-ghost" id="finLastMonth">Last month</button>
          <button class="btn btn-ghost" id="finThisYear">This year</button>
        </div>

        <div class="stat-grid stat-grid-3">
          <div class="stat-card stat-card-income">
            <span class="stat-label">Income received</span>
            <span class="stat-value" id="financeIncome">₹0</span>
            <span class="stat-foot" id="financeIncomeFoot"></span>
          </div>
          <div class="stat-card stat-card-expense">
            <span class="stat-label">Expenses</span>
            <span class="stat-value" id="financeExpense">₹0</span>
            <span class="stat-foot" id="financeExpenseFoot"></span>
          </div>
          <div class="stat-card stat-card-balance">
            <span class="stat-label">Net</span>
            <span class="stat-value" id="financeBalance">₹0</span>
            <span class="stat-foot" id="financeBalanceFoot"></span>
          </div>
        </div>

        <p class="finance-deposit-note" id="financeDepositNote"></p>

        <div class="finance-breakdowns">
          <div class="finance-panel">
            <h3>Where the money came from</h3>
            <div id="financeByMethod"></div>
          </div>
          <div class="finance-panel">
            <h3>What it went on</h3>
            <div id="financeByCategory"></div>
          </div>
          <div class="finance-panel">
            <h3>Spend per vehicle</h3>
            <div id="financeByVehicle"></div>
          </div>
        </div>

        <div class="panel-header panel-header-sub">
          <h3>Expenses</h3>
          <label class="finance-toggle">
            <input type="checkbox" id="finShowVoided"> Show voided
          </label>
        </div>
        <div id="expensesWrap"></div>
      </section>

      <!-- Record an expense.

       The "are you sure?" dialog that used to sit here has moved to
       dialog.js, which draws every question the panel asks -- so the list of
       what is about to be removed, and everything else that used to be
       crammed into a browser confirm(), is built there instead of marked up
       on this page. -->
  <!-- ===== Correct a customer's enquiry ===== -->
  <div class="modal-overlay" id="enquiryEditOverlay" hidden>
    <div class="modal modal-wide">
      <h3>Correct enquiry details</h3>
      <p class="modal-note">What the customer typed. The original is kept in the audit log.</p>
      <form id="enquiryEditForm">
        <input type="hidden" id="enqEditId" />
        <div class="modal-row">
          <div class="field-group">
            <label for="enqEditName">Name</label>
            <input type="text" id="enqEditName" required />
          </div>
          <div class="field-group">
            <label for="enqEditPhone">Phone Number</label>
            <div class="phone-field"><?= dial_select('enqEditPhoneCode') ?>
            <input type="tel" id="enqEditPhone" required inputmode="numeric" /></div>
            <p class="field-hint" id="enqEditPhoneHint"></p>
          </div>
        </div>
        <div class="modal-row">
          <div class="field-group">
            <label for="enqEditEmail">Email</label>
            <input type="email" id="enqEditEmail" placeholder="Optional" />
          </div>
          <div class="field-group">
            <label for="enqEditVehicle">Vehicle asked for</label>
            <select id="enqEditVehicle"><option value="">Not specified</option></select>
          </div>
        </div>
        <div class="modal-row modal-row-3">
          <div class="field-group">
            <label for="enqEditStart">Start date</label>
            <input type="date" id="enqEditStart" />
          </div>
          <div class="field-group">
            <label for="enqEditReturn">Return date</label>
            <input type="date" id="enqEditReturn" />
          </div>
          <div class="field-group">
            <label for="enqEditPickup">Pickup</label>
            <input type="text" id="enqEditPickup" maxlength="190" placeholder="e.g. Nagercoil Junction" />
          </div>
        </div>
        <div class="field-group">
          <label for="enqEditRequirements">Requirements</label>
          <textarea id="enqEditRequirements" rows="2"></textarea>
        </div>
        <div class="field-group">
          <label for="enqEditMessage">Message</label>
          <textarea id="enqEditMessage" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="enqEditCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save corrections</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="expenseModalOverlay" hidden>
        <div class="modal">
          <h3 id="expenseModalTitle">Record Expense</h3>
          <form id="expenseForm">
            <div class="modal-row">
              <div class="field-group">
                <label for="expAmount">Amount (₹)</label>
                <input type="number" id="expAmount" required min="1" step="0.01" placeholder="1500" />
              </div>
              <div class="field-group">
                <label for="expDate">Date</label>
                <input type="date" id="expDate" required />
              </div>
            </div>
            <div class="modal-row">
              <div class="field-group">
                <label for="expCategory">Category</label>
                <select id="expCategory" required><?= options_for(EXPENSE_CATEGORIES) ?></select>
              </div>
              <div class="field-group">
                <label for="expMethod">Paid by</label>
                <select id="expMethod" required><?= options_for(EXPENSE_METHODS) ?></select>
              </div>
            </div>
            <div class="modal-row">
              <div class="field-group">
                <label for="expVehicle">Vehicle (optional)</label>
                <select id="expVehicle"><option value="">Not vehicle-specific</option></select>
              </div>
              <div class="field-group">
                <label for="expVendor">Paid to (optional)</label>
                <input type="text" id="expVendor" maxlength="120" placeholder="e.g. Indian Oil, Nagercoil" />
              </div>
            </div>
            <div class="field-group">
              <label for="expDescription">What it was for</label>
              <input type="text" id="expDescription" maxlength="255" placeholder="e.g. Full tank before handover" />
            </div>
            <p class="booking-conflict-error" id="expenseFormError"></p>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" id="expenseModalCancel">Cancel</button>
              <button type="submit" class="btn btn-primary">Record Expense</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Reports tab -->
      <section class="admin-panel" id="panel-reports" hidden>
        <div class="panel-header">
          <div>
            <h2>Reports</h2>
            <p>Booking, revenue, vehicle, KM, deposit, and payment reports — all computed from your booking records.</p>
          </div>
        </div>

        <nav class="report-tabs">
          <button class="report-tab active" data-report="booking">Booking Report</button>
          <button class="report-tab" data-report="revenue">Revenue Report</button>
          <button class="report-tab" data-report="vehicle">Vehicle Report</button>
          <button class="report-tab" data-report="km">KM Report</button>
          <button class="report-tab" data-report="deposit">Deposit Report</button>
          <button class="report-tab" data-report="payment">Payment Report</button>
        </nav>

        <div class="report-filters" id="reportFilters"></div>

        <div class="report-export-row">
          <button class="btn btn-outline btn-sm" id="exportCsvBtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg> CSV</button>
          <button class="btn btn-outline btn-sm" id="exportExcelBtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg> Excel</button>
          <button class="btn btn-outline btn-sm" id="exportPdfBtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1"/><path d="M6 17v4h12v-4"/></svg> Print / PDF</button>
        </div>

        <div class="report-results" id="reportResults"></div>
      </section>
<?php admin_shell_close(); ?>

  <!-- ===== Car edit/add modal ===== -->
  <div class="modal-overlay" id="carModalOverlay" hidden>
    <div class="modal modal-wide">
      <h3 id="carModalTitle">Add Car</h3>
      <form id="carForm">
        <input type="hidden" id="carId" />
        <div class="modal-row">
          <div class="field-group">
            <label for="carBrand">Brand</label>
            <input type="text" id="carBrand" required placeholder="e.g. Suzuki" />
          </div>
          <div class="field-group">
            <label for="carBodyType">Body Type</label>
            <select id="carBodyType" required><?= options_for(BODY_TYPES) ?></select>
          </div>
        </div>
        <div class="modal-row modal-row-3">
          <div class="field-group">
            <label for="carName">Listing Name</label>
            <input type="text" id="carName" required placeholder="e.g. Fronx — Brand New 2026" />
          </div>
          <div class="field-group">
            <label for="carRegNumber">Registration Number</label>
            <input type="text" id="carRegNumber" required placeholder="e.g. KA05AB1234" style="text-transform:uppercase" />
          </div>
          <div class="field-group">
            <label for="carColor">Colour</label>
            <input type="color" id="carColor" required value="#5B6472" class="color-input" />
          </div>
        </div>
        <div class="modal-row">
          <div class="field-group">
            <label for="carFuel">Fuel</label>
            <select id="carFuel" required><?= options_for(FUEL_TYPES) ?></select>
          </div>
          <div class="field-group">
            <label for="carTransmission">Transmission</label>
            <select id="carTransmission" required><?= options_for(TRANSMISSIONS) ?></select>
          </div>
        </div>
        <div class="modal-row modal-row-3">
          <div class="field-group">
            <label for="carSeats">Seats</label>
            <input type="number" id="carSeats" required min="2" max="9" placeholder="5" />
          </div>
          <div class="field-group">
            <label for="carYear">Year</label>
            <input type="number" id="carYear" required min="2000" max="2030" placeholder="2025" />
          </div>
          <div class="field-group">
            <label for="carStatus">Status</label>
            <select id="carStatus" required><?= options_for(VEHICLE_STATUSES) ?></select>
          </div>
        </div>

        <!-- Whose car this is. Everything about the money follows from it: on
             our own car the whole rental is ours, on somebody else's most of it
             is theirs and what we keep is the commission. -->
        <p class="modal-section-label">Whose car is this?</p>
        <div class="modal-row">
          <div class="field-group">
            <label for="carOwnership">Owner</label>
            <select id="carOwnership" required>
              <option value="own">Ours</option>
              <option value="partner">Someone else's — we take a commission</option>
            </select>
          </div>
          <div class="field-group" data-partner-only hidden>
            <label for="carOwnerName">Car owner's name</label>
            <input type="text" id="carOwnerName" placeholder="Who the car belongs to" />
          </div>
        </div>
        <div class="modal-row" data-partner-only hidden>
          <div class="field-group">
            <label for="carOwnerPhone">Car owner's phone</label>
            <div class="phone-field"><?= dial_select('carOwnerPhoneCode') ?><input type="tel" id="carOwnerPhone" inputmode="numeric" placeholder="Optional" /></div><p class="field-hint" id="carOwnerPhoneHint"></p>
          </div>
          <div class="field-group">
            <label class="finance-toggle" for="carTemporary">
              <input type="checkbox" id="carTemporary" />
              Temporary — brought in for a hire or two
            </label>
            <p class="field-hint">Ticked, it is never shown on the website — no fleet
              page, no tariff, no car list on the enquiry form. It still books here
              like any other car. It also shows as temporary in the fleet below, so it
              can be found and retired once the hire is over.</p>
          </div>
        </div>

        <p class="modal-section-label">Papers and service</p>
        <p class="field-hint">Leave a date empty and it is simply not watched.
          Anything filled in appears under &ldquo;Needs attention&rdquo; a month before it runs out.</p>
        <div class="modal-row modal-row-3">
          <div class="field-group"><label for="carPurchaseDate">Purchase date</label><input type="date" id="carPurchaseDate" /></div>
          <div class="field-group"><label for="carInsuranceExpiry">Insurance expires</label><input type="date" id="carInsuranceExpiry" /></div>
          <div class="field-group"><label for="carPollutionExpiry">Pollution certificate expires</label><input type="date" id="carPollutionExpiry" /></div>
        </div>
        <div class="modal-row modal-row-3">
          <div class="field-group"><label for="carFitnessExpiry">Fitness certificate expires</label><input type="date" id="carFitnessExpiry" /></div>
          <div class="field-group"><label for="carServiceDueKm">Next service at (KM)</label><input type="number" id="carServiceDueKm" min="0" placeholder="e.g. 48000" /></div>
          <div class="field-group"><label for="carServiceDueOn">Next service by</label><input type="date" id="carServiceDueOn" /></div>
        </div>

        <p class="modal-section-label">GPS tracker</p>
        <p class="field-hint">Different cars are on different trackers, so the provider
          is recorded per car. The link opens that provider's own page for this vehicle.</p>
        <div class="modal-row modal-row-3">
          <div class="field-group"><label for="carGpsProvider">Provider</label><input type="text" id="carGpsProvider" placeholder="Optional" /></div>
          <div class="field-group"><label for="carGpsDeviceId">Device ID</label><input type="text" id="carGpsDeviceId" placeholder="Optional" /></div>
          <div class="field-group"><label for="carGpsUrl">Tracking link</label><input type="url" id="carGpsUrl" placeholder="https://..." /></div>
        </div>

        <p class="modal-section-label">Rate Card (₹)</p>
        <div class="modal-row modal-row-4">
          <div class="field-group">
            <label for="carPrice">Daily</label>
            <input type="number" id="carPrice" required min="0" placeholder="1600" />
          </div>
          <div class="field-group">
            <label for="carPriceMax">Daily, up to</label>
            <input type="number" id="carPriceMax" min="0" placeholder="1800" />
          </div>
          <div class="field-group">
            <label for="carPrice7">7-Day</label>
            <input type="number" id="carPrice7" min="0" placeholder="19000" />
          </div>
          <div class="field-group">
            <label for="carPrice30">Monthly</label>
            <input type="number" id="carPrice30" min="0" placeholder="38000" />
          </div>
        </div>
        <p class="field-hint">
          Leave <strong>Daily, up to</strong> empty for one price. Fill it and the
          site shows a range &mdash; &ldquo;&#8377;1,600 &ndash; &#8377;1,800 / day&rdquo;.
          Bookings are still charged at the <strong>Daily</strong> figure.
        </p>
        <div class="modal-row">
          <div class="field-group">
            <label for="carPrice15">15-Day</label>
            <input type="number" id="carPrice15" min="0" placeholder="36000" />
          </div>
        </div>

        <p class="modal-section-label">KM &amp; Deposit</p>
        <div class="modal-row modal-row-3">
          <div class="field-group">
            <label for="carKmLimit">KM Limit / day</label>
            <input type="number" id="carKmLimit" required min="0" placeholder="200" />
          </div>
          <div class="field-group">
            <label for="carExtraKmRate">Extra KM Rate (₹)</label>
            <input type="number" id="carExtraKmRate" required min="0" placeholder="10" />
          </div>
          <div class="field-group">
            <label for="carSecurityDeposit">Security Deposit (₹)</label>
            <input type="number" id="carSecurityDeposit" required min="0" placeholder="5000" />
          </div>
        </div>
        <div class="field-group">
          <label for="carCurrentKm">Current Odometer (KM)</label>
          <input type="number" id="carCurrentKm" required min="0" placeholder="4200" />
        </div>

        <!-- The photograph is uploaded after the vehicle is saved, because it
             is stored against a vehicle id and a new vehicle has none yet. The
             form hides that: pick a file, press Save, and both happen. -->
        <div class="field-group">
          <label for="carPhoto">Photograph</label>
          <div class="photo-field">
            <div class="photo-preview" id="carPhotoPreview" hidden>
              <img alt="" id="carPhotoPreviewImg" />
              <button type="button" class="btn btn-danger btn-sm" id="carPhotoRemove">Remove</button>
            </div>

            <!-- Shown only while a newly chosen photograph is being framed.
                 The window is the exact shape the website's cards use, so what
                 is inside it is what a customer sees -- no guessing at how it
                 will be cut. -->
            <div class="photo-crop" id="carCropBox" hidden>
              <div class="crop-window" id="carCropWindow">
                <img id="carCropImg" alt="" draggable="false" />
              </div>
              <label class="crop-zoom">
                Zoom
                <input type="range" id="carCropZoom" min="100" max="300" value="100" />
              </label>
              <p class="field-note">Drag the photo to choose what shows. Every car is saved at
              the same size, so the cards line up.</p>
            </div>

            <input type="file" id="carPhoto" accept="image/jpeg,image/png,image/webp,image/avif" />
            <p class="field-note">Shown on the website's fleet cards. JPG, PNG, WebP or AVIF,
            up to 6&nbsp;MB. A landscape photo of the whole car works best.</p>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="carModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Vehicle</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Booking create/edit modal ===== -->
  <div class="modal-overlay" id="bookingModalOverlay" hidden>
    <div class="modal modal-wide">
      <h3 id="bookingModalTitle">New Booking</h3>
      <p class="booking-number-preview" id="bookingNumberPreview"></p>
      <form id="bookingForm">
        <input type="hidden" id="bookingId" />

        <p class="modal-section-label">Customer Details</p>
        <div class="modal-row">
          <div class="field-group"><label for="bkCustomerName">Customer Name</label><input type="text" id="bkCustomerName" required placeholder="e.g. Ravi Kumar" /></div>
          <div class="field-group"><label for="bkPhone">Phone Number</label><div class="phone-field"><?= dial_select('bkPhoneCode') ?><input type="tel" id="bkPhone" required inputmode="numeric" autocomplete="tel-national" placeholder="9876543210" /></div><p class="field-hint" id="bkPhoneHint"></p></div>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="bkAddress">Address</label><textarea id="bkAddress" rows="3" placeholder="Door and street&#10;Town&#10;District and PIN"></textarea></div>
          <div class="field-group"><label for="bkLicence">Driving Licence Number</label><input type="text" id="bkLicence" required placeholder="e.g. KA0120230012345" /></div>
        </div>

        <p class="modal-section-label">Vehicle &amp; Rental Period</p>
        <div class="modal-row">
          <div class="field-group">
            <label for="bkWhatsapp">WhatsApp Number</label>
            <div class="phone-field"><?= dial_select('bkWhatsappCode') ?>
            <input type="tel" id="bkWhatsapp" inputmode="numeric" placeholder="If different from the phone" /></div>
            <p class="field-hint" id="bkWhatsappHint"></p>
          </div>
          <div class="field-group">
            <label for="bkLicenceExpiry">Licence Expiry</label>
            <input type="date" id="bkLicenceExpiry" />
            <p class="field-hint">A licence that runs out mid-hire is the owner's liability.</p>
          </div>
        </div>
        <div class="modal-row modal-row-3">
          <div class="field-group">
            <label for="bkIdNumber">Aadhaar / ID Number</label>
            <input type="text" id="bkIdNumber" placeholder="Optional" />
          </div>
          <div class="field-group">
            <label for="bkCustomerType">Customer Type</label>
            <select id="bkCustomerType">
              <option value="New">New customer</option>
              <option value="Returning">Returning customer</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
          <div class="field-group">
            <label for="bkEstimatedKm">Estimated KM</label>
            <input type="number" id="bkEstimatedKm" min="0" placeholder="What they expect to drive" />
          </div>
          <div class="field-group">
            <label for="bkReferral">How did they find us?</label>
            <select id="bkReferral">
              <option value="">Not asked</option>
              <?php foreach (REFERRAL_SOURCES as $key => $label): ?>
                <option value="<?= e($key) ?>"><?= e($label) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
        </div>

        <p class="modal-section-label">Vehicle</p>
        <div class="modal-row">
          <div class="field-group"><label for="bkVehicle">Vehicle</label><select id="bkVehicle" required></select></div>
          <div class="field-group"><label for="bkVehicleReg">Vehicle Registration Number</label><input type="text" id="bkVehicleReg" readonly /></div>
        </div>
        <div class="modal-row modal-row-4">
          <div class="field-group"><label for="bkStartDate">Start Date</label><input type="date" id="bkStartDate" required /></div>
          <div class="field-group"><label for="bkStartTime">Start Time</label><input type="time" id="bkStartTime" required value="10:00" /></div>
          <div class="field-group"><label for="bkReturnDate">Return Date</label><input type="date" id="bkReturnDate" required /></div>
          <div class="field-group"><label for="bkReturnTime">Return Time</label><input type="time" id="bkReturnTime" required value="10:00" /></div>
        </div>
        <p class="field-hint">Rental Duration: <strong id="bkDurationPreview">1 day</strong></p>
        <p class="booking-conflict-error" id="bookingConflictError"></p>

        <p class="modal-section-label">Charges</p>
        <div class="modal-row modal-row-3">
          <div class="field-group"><label for="bkRentalAmount">Rental Amount (₹)</label><input type="number" id="bkRentalAmount" required min="0" placeholder="9000" /><p class="rate-suggest" id="bkRentalSuggest" hidden><span id="bkRentalSuggestText"></span> <button type="button" class="btn-link" id="bkRentalApply">Use this</button></p></div>
          <div class="field-group"><label for="bkKmLimit">KM Limit / day</label><input type="number" id="bkKmLimit" required min="0" placeholder="200" /></div>
          <div class="field-group"><label for="bkExtraKmRate">Extra KM Rate (₹)</label><input type="number" id="bkExtraKmRate" required min="0" placeholder="10" /></div>
        </div>

        <!-- The rate card amount, what came off it, and what is actually
             charged. Without these an amount that is not the rate card amount
             has no explanation anywhere, and a month later nobody can say
             whether a discount was agreed or a digit was dropped. -->
        <div class="modal-row modal-row-3">
          <div class="field-group">
            <label for="bkDiscount">Discount (₹)</label>
            <input type="number" id="bkDiscount" min="0" placeholder="0" />
          </div>
          <div class="field-group">
            <label for="bkOtherCharges">Other charges (₹)</label>
            <input type="number" id="bkOtherCharges" min="0" placeholder="0" />
          </div>
          <div class="field-group">
            <span class="c-label">Customer pays</span>
            <p class="final-price" id="bkFinalPrice">₹0</p>
          </div>
        </div>

        <!-- Shown only when the chosen car belongs to somebody else. On our
             own cars there is no commission to take and a box asking for one
             is a box someone will eventually type into. -->
        <div class="modal-row" id="bkCommissionRow" hidden>
          <div class="field-group">
            <label for="bkCommission">Your commission (₹)</label>
            <input type="number" id="bkCommission" min="0" placeholder="1500" />
            <p class="field-hint" id="bkCommissionHint">The rest of the rental goes to the car's owner.</p>
          </div>
        </div>

        <!-- Every booking, not only a brokered one: a monthly hire paid half
             now and the rest in a few days is the commonest case for it, and
             without a date the second half is remembered by whoever took the
             booking and nobody else. -->
        <div class="modal-row">
          <div class="field-group">
            <label for="bkBalanceDue">Balance due by</label>
            <input type="date" id="bkBalanceDue" />
            <p class="field-hint">Optional. For a half-now, rest-later arrangement —
              the booking shows in "Payments due" from this date.</p>
          </div>
        </div>
        <div class="field-group"><label for="bkNotes">Notes</label><input type="text" id="bkNotes" placeholder="Optional notes about this booking" /></div>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="bookingModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Booking</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Booking detail modal (populated dynamically) ===== -->

  <!-- ===== Payment modal ===== -->
  <div class="modal-overlay" id="paymentModalOverlay" hidden>
    <div class="modal">
      <h3>Add Payment</h3>
      <form id="paymentForm">
        <input type="hidden" id="paymentBookingId" />
        <div class="field-group">
          <label for="paymentType">Payment Type</label>
          <select id="paymentType" required>
            <option value="advance">Advance</option>
            <option value="balance">Balance</option>
            <option value="additional">Additional Payment</option>
            <option value="extra_km">Extra KM</option>
          </select>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="paymentAmount">Amount (₹)</label><input type="number" id="paymentAmount" required min="0" placeholder="10000" /></div>
          <div class="field-group"><label for="paymentDate">Payment Date</label><input type="date" id="paymentDate" required /></div>
        </div>
        <div class="modal-row">
          <div class="field-group">
            <label for="paymentMethod">Payment Method</label>
            <select id="paymentMethod" required>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>
          </div>
          <div class="field-group"><label for="paymentReference">Transaction / Reference No.</label><input type="text" id="paymentReference" placeholder="e.g. UPI Ref / UTR" /></div>
        </div>
        <div class="field-group"><label for="paymentNotes">Notes</label><input type="text" id="paymentNotes" placeholder="Optional" /></div>
        <div class="field-group">
          <label for="paymentProof">Payment Screenshot / Receipt</label>
          <input type="file" id="paymentProof" accept="image/*" />
          <div class="proof-preview" id="paymentProofPreview"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="paymentModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Payment</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Security deposit modal ===== -->
  <div class="modal-overlay" id="depositModalOverlay" hidden>
    <div class="modal">
      <h3>Security Deposit</h3>
      <form id="depositForm">
        <input type="hidden" id="depositBookingId" />
        <div class="modal-row">
          <div class="field-group"><label for="depositAmount">Deposit Amount (₹)</label><input type="number" id="depositAmount" required min="0" placeholder="5000" /></div>
          <div class="field-group"><label for="depositDate">Deposit Date</label><input type="date" id="depositDate" required /></div>
        </div>
        <div class="modal-row">
          <div class="field-group">
            <label for="depositMethod">Payment Method</label>
            <select id="depositMethod" required>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>
          </div>
          <div class="field-group"><label for="depositReference">Reference Number</label><input type="text" id="depositReference" placeholder="Optional" /></div>
        </div>
        <div class="field-group"><label for="depositNotes">Notes</label><input type="text" id="depositNotes" placeholder="Optional" /></div>
        <div class="field-group">
          <label for="depositProof">Deposit Proof</label>
          <input type="file" id="depositProof" accept="image/*" />
          <div class="proof-preview" id="depositProofPreview"></div>
        </div>
        <p class="field-hint">This is tracked separately and is <strong>not</strong> counted as rental revenue.</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="depositModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Deposit</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Deposit refund modal ===== -->
  <div class="modal-overlay" id="refundModalOverlay" hidden>
    <div class="modal">
      <h3>Refund Security Deposit</h3>
      <p class="field-hint">Original Deposit: <strong id="refundOriginalDeposit">₹0</strong></p>
      <form id="refundForm">
        <input type="hidden" id="refundBookingId" />
        <div class="modal-row">
          <div class="field-group"><label for="refundDeduction">Deduction Amount (₹)</label><input type="number" id="refundDeduction" required min="0" value="0" /></div>
          <div class="field-group"><label for="refundReason">Deduction Reason</label><input type="text" id="refundReason" placeholder="e.g. Minor scratch" /></div>
        </div>
        <p class="field-hint">Refund Amount: <strong id="refundAmountPreview">₹0</strong></p>
        <div class="modal-row">
          <div class="field-group"><label for="refundDate">Refund Date</label><input type="date" id="refundDate" required /></div>
          <div class="field-group">
            <label for="refundMethod">Refund Method</label>
            <select id="refundMethod" required>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div class="field-group"><label for="refundReference">Refund Reference</label><input type="text" id="refundReference" placeholder="Optional" /></div>
        <div class="field-group"><label for="refundNotes">Notes</label><input type="text" id="refundNotes" placeholder="Optional" /></div>
        <div class="field-group">
          <label for="refundProof">Refund Proof</label>
          <input type="file" id="refundProof" accept="image/*" />
          <div class="proof-preview" id="refundProofPreview"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="refundModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Refund</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Vehicle service modal ===== -->
  <div class="modal-overlay" id="serviceModalOverlay" hidden>
    <div class="modal">
      <h3 id="serviceModalTitle">Record a service</h3>
      <form id="serviceForm">
        <input type="hidden" id="serviceVehicleId" />
        <div class="modal-row">
          <div class="field-group"><label for="serviceDate">Service date</label><input type="date" id="serviceDate" required /></div>
          <div class="field-group"><label for="serviceOdometer">Odometer (KM)</label><input type="number" id="serviceOdometer" min="0" placeholder="42350" /></div>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="serviceType">What was done</label><input type="text" id="serviceType" required placeholder="e.g. Oil and filter change" /></div>
          <div class="field-group"><label for="serviceAmount">Amount (₹)</label><input type="number" id="serviceAmount" min="0" placeholder="3500" /></div>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="serviceGarage">Garage</label><input type="text" id="serviceGarage" placeholder="Optional" /></div>
          <div class="field-group"><label for="serviceNote">Notes</label><input type="text" id="serviceNote" placeholder="Optional" /></div>
        </div>
        <p class="modal-section-label">When is the next one</p>
        <div class="modal-row">
          <div class="field-group">
            <label for="serviceNextKm">Next service at (KM)</label>
            <input type="number" id="serviceNextKm" min="0" placeholder="48000" />
          </div>
          <div class="field-group">
            <label for="serviceNextOn">Next service by</label>
            <input type="date" id="serviceNextOn" />
          </div>
        </div>
        <p class="field-hint">Either is enough. Whichever comes first puts the car
          under &ldquo;Needs attention&rdquo;.</p>
        <div id="serviceHistory"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="serviceModalCancel">Close</button>
          <button type="submit" class="btn btn-primary">Save service</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Vehicle pickup modal ===== -->
  <div class="modal-overlay" id="pickupModalOverlay" hidden>
    <div class="modal">
      <h3>Vehicle Pickup</h3>
      <form id="pickupForm">
        <input type="hidden" id="pickupBookingId" />
        <div class="modal-row">
          <div class="field-group"><label for="pickupDateField">Pickup Date</label><input type="date" id="pickupDateField" required /></div>
          <div class="field-group"><label for="pickupTimeField">Pickup Time</label><input type="time" id="pickupTimeField" required /></div>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="pickupStartKm">Starting KM</label><input type="number" id="pickupStartKm" required min="0" placeholder="4200" /></div>
          <div class="field-group">
            <label for="pickupFuelLevel">Starting Fuel Level</label>
            <select id="pickupFuelLevel" required>
              <option>Full</option>
              <option>3/4</option>
              <option>1/2</option>
              <option>1/4</option>
              <option>Empty</option>
            </select>
          </div>
        </div>
        <div class="field-group"><label for="pickupCondition">Vehicle Condition</label><input type="text" id="pickupCondition" placeholder="e.g. Clean, no visible damage" /></div>
        <div class="field-group"><label for="pickupNotes">Pickup Notes</label><input type="text" id="pickupNotes" placeholder="Optional" /></div>
        <p class="modal-section-label">Handover checklist</p>
        <p class="field-hint">What was checked when the keys changed hands. Unticked is
          not a failure &mdash; it is simply not checked, and saying so is the point.</p>
        <div class="check-grid" id="pickupChecklist">
            <label class="check-item"><input type="checkbox" id="pickupChk_exterior" data-check="exterior"> Exterior condition</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_interior" data-check="interior"> Interior condition</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_tyres" data-check="tyres"> Tyres</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_spare" data-check="spare"> Spare tyre</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_tools" data-check="tools"> Jack and tools</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_documents" data-check="documents"> RC, insurance, FC in the car</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_ac" data-check="ac"> Air conditioning</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_lights" data-check="lights"> Headlights</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_indicators" data-check="indicators"> Indicators</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_horn" data-check="horn"> Horn</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_mirrors" data-check="mirrors"> Mirrors</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_wipers" data-check="wipers"> Wipers</label>
            <label class="check-item"><input type="checkbox" id="pickupChk_stepney" data-check="stepney"> Toolkit complete</label>
        </div>
        <div class="field-group">
          <label for="pickupPhotos">Pickup Photos</label>
          <input type="file" id="pickupPhotos" accept="image/*" multiple />
          <div class="proof-preview" id="pickupPhotosPreview"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="pickupModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Pickup</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ===== Vehicle return modal ===== -->
  <div class="modal-overlay" id="returnModalOverlay" hidden>
    <div class="modal">
      <h3>Vehicle Return</h3>
      <form id="returnForm">
        <input type="hidden" id="returnBookingId" />
        <div class="modal-row">
          <div class="field-group"><label for="returnDateField">Return Date</label><input type="date" id="returnDateField" required /></div>
          <div class="field-group"><label for="returnTimeField">Return Time</label><input type="time" id="returnTimeField" required /></div>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="returnEndKm">Ending KM</label><input type="number" id="returnEndKm" required min="0" placeholder="5800" /></div>
          <div class="field-group">
            <label for="returnFuelLevel">Ending Fuel Level</label>
            <select id="returnFuelLevel" required>
              <option>Full</option>
              <option>3/4</option>
              <option>1/2</option>
              <option>1/4</option>
              <option>Empty</option>
            </select>
          </div>
        </div>
        <div class="field-group"><label for="returnCondition">Return Condition</label><input type="text" id="returnCondition" placeholder="e.g. Minor scratch on rear bumper" /></div>
        <div class="field-group"><label for="returnNotes">Return Notes</label><input type="text" id="returnNotes" placeholder="Optional" /></div>
        <p class="modal-section-label">Charges on return</p>
        <p class="field-hint">Each on its own line, because a customer does not accept
          &ldquo;other charges&rdquo; and nobody can explain one a month later.</p>
        <div class="modal-row modal-row-3">
          <div class="field-group"><label for="returnCleaning">Cleaning (₹)</label><input type="number" id="returnCleaning" min="0" placeholder="0" /></div>
          <div class="field-group"><label for="returnFuel">Fuel (₹)</label><input type="number" id="returnFuel" min="0" placeholder="0" /></div>
          <div class="field-group"><label for="returnLate">Late return (₹)</label><input type="number" id="returnLate" min="0" placeholder="0" /></div>
        </div>
        <div class="modal-row">
          <div class="field-group"><label for="returnOther">Other charge (₹)</label><input type="number" id="returnOther" min="0" placeholder="0" /></div>
          <div class="field-group"><label for="returnOtherNote">What for</label><input type="text" id="returnOtherNote" placeholder="Needed if there is an other charge" /></div>
        </div>

        <p class="modal-section-label">Damage</p>
        <div class="modal-row">
          <div class="field-group">
            <label for="returnDamage">New damage</label>
            <input type="text" id="returnDamage" placeholder="e.g. Front bumper scratch" />
          </div>
          <div class="field-group">
            <label for="returnDamageCost">Estimated cost (₹)</label>
            <input type="number" id="returnDamageCost" min="0" placeholder="2500" />
          </div>
        </div>
        <div class="modal-row">
          <div class="field-group">
            <label class="finance-toggle" for="returnDamageCharge">
              <input type="checkbox" id="returnDamageCharge" />
              Charge this to the customer
            </label>
            <p class="field-hint">Left unticked the damage is recorded but not billed &mdash;
              hold it back from the deposit instead, or absorb it.</p>
          </div>
        </div>

        <p class="modal-section-label">Handover checklist</p>
        <p class="field-hint">What was checked when the keys changed hands. Unticked is
          not a failure &mdash; it is simply not checked, and saying so is the point.</p>
        <div class="check-grid" id="returnChecklist">
            <label class="check-item"><input type="checkbox" id="returnChk_exterior" data-check="exterior"> Exterior condition</label>
            <label class="check-item"><input type="checkbox" id="returnChk_interior" data-check="interior"> Interior condition</label>
            <label class="check-item"><input type="checkbox" id="returnChk_tyres" data-check="tyres"> Tyres</label>
            <label class="check-item"><input type="checkbox" id="returnChk_spare" data-check="spare"> Spare tyre</label>
            <label class="check-item"><input type="checkbox" id="returnChk_tools" data-check="tools"> Jack and tools</label>
            <label class="check-item"><input type="checkbox" id="returnChk_documents" data-check="documents"> RC, insurance, FC in the car</label>
            <label class="check-item"><input type="checkbox" id="returnChk_ac" data-check="ac"> Air conditioning</label>
            <label class="check-item"><input type="checkbox" id="returnChk_lights" data-check="lights"> Headlights</label>
            <label class="check-item"><input type="checkbox" id="returnChk_indicators" data-check="indicators"> Indicators</label>
            <label class="check-item"><input type="checkbox" id="returnChk_horn" data-check="horn"> Horn</label>
            <label class="check-item"><input type="checkbox" id="returnChk_mirrors" data-check="mirrors"> Mirrors</label>
            <label class="check-item"><input type="checkbox" id="returnChk_wipers" data-check="wipers"> Wipers</label>
            <label class="check-item"><input type="checkbox" id="returnChk_stepney" data-check="stepney"> Toolkit complete</label>
        </div>
        <div class="field-group">
          <label for="returnPhotos">Return Photos</label>
          <input type="file" id="returnPhotos" accept="image/*" multiple />
          <div class="proof-preview" id="returnPhotosPreview"></div>
        </div>
        <p class="field-hint" id="returnKmPreview"></p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="returnModalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Return</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Who the business is, for the booking confirmation a customer is given.
       Written once into the page rather than fetched: it is four lines that
       change twice a year, and a document somebody is about to hand over
       should not be waiting on a request to find out who sent it. -->
  <script type="application/json" id="businessDetails"><?= json_encode(
      business_details() + ['terms' => booking_terms()],
      JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
  ) ?></script>

  <script src="<?= asset('api.js') ?>"></script>
  <script src="<?= asset('car-data.js') ?>"></script>
  <script src="<?= asset('booking-data.js') ?>"></script>
  <script src="<?= asset('admin.js') ?>"></script>
  <script src="<?= asset('booking-dates.js') ?>"></script>
</body>
</html>
