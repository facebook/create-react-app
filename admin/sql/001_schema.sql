-- NiteSha Cars — core schema
--
-- Conventions used throughout:
--
--   Money is DECIMAL(12,2), never FLOAT. Floating point cannot represent
--   most decimal fractions exactly, so sums drift by a paisa here and there
--   — unacceptable in records an auditor has to reconcile.
--
--   Financial rows are append-only. Payments, deposits, refunds, expenses
--   and KM readings are never UPDATEd or DELETEd. A correction is a new row
--   pointing at the one it corrects, and cancelling is a status change with
--   a reason and an author. This is what lets the books be reconstructed for
--   any past date.
--
--   Bookings snapshot their pricing at creation. They never read today's
--   vehicle rate, so changing a rate next month leaves history untouched.
--
--   Every table that records a business action carries created_by, so the
--   audit log can always answer who did it.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------- people --

CREATE TABLE IF NOT EXISTS roles (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(32)  NOT NULL,
  name        VARCHAR(64)  NOT NULL,
  description VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id        TINYINT UNSIGNED NOT NULL,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at  DATETIME     NULL,
  failed_logins  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until   DATETIME     NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_role (role_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  email          VARCHAR(190) NULL,
  address        VARCHAR(255) NULL,
  licence_number VARCHAR(40)  NULL,
  notes          TEXT         NULL,
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_customers_phone (phone),
  KEY ix_customers_name (name),
  CONSTRAINT fk_customers_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------- vehicles --

CREATE TABLE IF NOT EXISTS vehicles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  brand         VARCHAR(60)  NOT NULL,
  reg_number    VARCHAR(20)  NOT NULL,
  body_type     ENUM('Hatchback','Sedan','SUV','MUV','Other') NOT NULL DEFAULT 'Hatchback',
  fuel          ENUM('Petrol','Diesel','Electric','CNG')      NOT NULL DEFAULT 'Petrol',
  transmission  ENUM('Manual','Automatic')                    NOT NULL DEFAULT 'Manual',
  seats         TINYINT UNSIGNED NOT NULL DEFAULT 5,
  model_year    SMALLINT UNSIGNED NOT NULL,
  colour        VARCHAR(16)  NOT NULL DEFAULT '#5B6472',
  status        ENUM('Available','Booked','On Rental','Maintenance','Inactive')
                NOT NULL DEFAULT 'Available',
  current_km    INT UNSIGNED NOT NULL DEFAULT 0,
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_reg (reg_number),
  KEY ix_vehicles_status (status),
  CONSTRAINT fk_vehicles_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rates are dated rather than edited in place, so a booking made in March can
-- still be explained by the rate card that was live in March.
CREATE TABLE IF NOT EXISTS vehicle_rates (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id        INT UNSIGNED NOT NULL,
  effective_from    DATE         NOT NULL,
  rate_daily        DECIMAL(12,2) NOT NULL,
  rate_7day         DECIMAL(12,2) NULL,
  rate_15day        DECIMAL(12,2) NULL,
  rate_30day        DECIMAL(12,2) NULL,
  km_limit_per_day  SMALLINT UNSIGNED NOT NULL DEFAULT 200,
  extra_km_rate     DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  security_deposit  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_by        INT UNSIGNED NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rate_per_day (vehicle_id, effective_from),
  CONSTRAINT fk_rates_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
  CONSTRAINT fk_rates_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------- enquiries and bookings --

CREATE TABLE IF NOT EXISTS enquiries (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  enquiry_number   VARCHAR(20)  NOT NULL,
  customer_id      INT UNSIGNED NULL,
  name             VARCHAR(120) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  email            VARCHAR(190) NULL,
  vehicle_id       INT UNSIGNED NULL,
  start_date       DATE         NULL,
  return_date      DATE         NULL,
  pickup_location  VARCHAR(190) NULL,
  message          TEXT         NULL,
  requirements     TEXT         NULL,
  source           VARCHAR(40)  NOT NULL DEFAULT 'website',
  status           ENUM('New','Contacted','Pending','Accepted','Rejected','Cancelled','Converted')
                   NOT NULL DEFAULT 'New',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_enquiry_number (enquiry_number),
  KEY ix_enquiries_status (status),
  KEY ix_enquiries_phone (phone),
  CONSTRAINT fk_enquiries_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
  CONSTRAINT fk_enquiries_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_number      VARCHAR(20)  NOT NULL,
  enquiry_id          INT UNSIGNED NULL,
  customer_id         INT UNSIGNED NOT NULL,
  vehicle_id          INT UNSIGNED NOT NULL,
  -- Copied at creation. The vehicle's registration can change hands later;
  -- what matters is what it was on the day.
  vehicle_reg_number  VARCHAR(20)  NOT NULL,
  start_at            DATETIME     NOT NULL,
  return_at           DATETIME     NOT NULL,
  duration_days       SMALLINT UNSIGNED NOT NULL,
  pickup_location     VARCHAR(190) NULL,
  return_location     VARCHAR(190) NULL,
  status              ENUM('Enquiry','Confirmed','Ready','Active','Returned','Completed','Cancelled')
                      NOT NULL DEFAULT 'Confirmed',
  notes               TEXT         NULL,
  cancelled_reason    VARCHAR(255) NULL,
  created_by          INT UNSIGNED NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_number (booking_number),
  KEY ix_bookings_status (status),
  KEY ix_bookings_vehicle_dates (vehicle_id, start_at, return_at),
  KEY ix_bookings_customer (customer_id),
  CONSTRAINT fk_bookings_enquiry  FOREIGN KEY (enquiry_id)  REFERENCES enquiries (id),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
  CONSTRAINT fk_bookings_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles (id),
  CONSTRAINT fk_bookings_creator  FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The frozen price of a booking. Written once at creation; a later change is
-- a new row with supersedes_id set, never an edit.
CREATE TABLE IF NOT EXISTS booking_charges (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id        INT UNSIGNED NOT NULL,
  supersedes_id     INT UNSIGNED NULL,
  rate_daily        DECIMAL(12,2) NOT NULL,
  km_limit_per_day  SMALLINT UNSIGNED NOT NULL,
  extra_km_rate     DECIMAL(8,2)  NOT NULL,
  deposit_required  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  base_rental       DECIMAL(12,2) NOT NULL,
  extra_km_charge   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  other_charges     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  other_charges_note VARCHAR(255) NULL,
  discount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_reason   VARCHAR(255) NULL,
  total             DECIMAL(12,2) NOT NULL,
  reason            VARCHAR(255) NULL,
  created_by        INT UNSIGNED NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_charges_booking (booking_id),
  CONSTRAINT fk_charges_booking    FOREIGN KEY (booking_id)    REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_charges_supersedes FOREIGN KEY (supersedes_id) REFERENCES booking_charges (id),
  CONSTRAINT fk_charges_creator    FOREIGN KEY (created_by)    REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- money --

CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_number  VARCHAR(20)  NOT NULL,
  booking_id      INT UNSIGNED NOT NULL,
  kind            ENUM('advance','balance','additional','extra_km') NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  paid_on         DATE         NOT NULL,
  method          ENUM('Cash','UPI','Card','Bank Transfer','Other') NOT NULL,
  reference       VARCHAR(120) NULL,
  notes           VARCHAR(255) NULL,
  -- Append-only: a mistake becomes a new row that corrects this one.
  corrects_id     INT UNSIGNED NULL,
  status          ENUM('active','voided','reversed') NOT NULL DEFAULT 'active',
  status_reason   VARCHAR(255) NULL,
  verified_by     INT UNSIGNED NULL,
  verified_at     DATETIME     NULL,
  created_by      INT UNSIGNED NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_number (payment_number),
  KEY ix_payments_booking (booking_id),
  KEY ix_payments_paid_on (paid_on),
  KEY ix_payments_status (status),
  CONSTRAINT fk_payments_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id),
  CONSTRAINT fk_payments_corrects FOREIGN KEY (corrects_id) REFERENCES payments (id),
  CONSTRAINT fk_payments_verifier FOREIGN KEY (verified_by) REFERENCES users (id),
  CONSTRAINT fk_payments_creator  FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Held separately from payments on purpose: a deposit is the customer's money
-- being held, not revenue earned, and must never be summed into income.
CREATE TABLE IF NOT EXISTS deposits (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id     INT UNSIGNED NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  received_on    DATE         NOT NULL,
  method         ENUM('Cash','UPI','Card','Bank Transfer','Other') NOT NULL,
  reference      VARCHAR(120) NULL,
  notes          VARCHAR(255) NULL,
  corrects_id    INT UNSIGNED NULL,
  status         ENUM('active','voided','reversed') NOT NULL DEFAULT 'active',
  status_reason  VARCHAR(255) NULL,
  verified_by    INT UNSIGNED NULL,
  verified_at    DATETIME     NULL,
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_deposits_booking (booking_id),
  CONSTRAINT fk_deposits_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id),
  CONSTRAINT fk_deposits_corrects FOREIGN KEY (corrects_id) REFERENCES deposits (id),
  CONSTRAINT fk_deposits_verifier FOREIGN KEY (verified_by) REFERENCES users (id),
  CONSTRAINT fk_deposits_creator  FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refunds (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  deposit_id        INT UNSIGNED NOT NULL,
  booking_id        INT UNSIGNED NOT NULL,
  deduction         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  deduction_reason  VARCHAR(255) NULL,
  refund_amount     DECIMAL(12,2) NOT NULL,
  refunded_on       DATE         NOT NULL,
  method            ENUM('Cash','UPI','Card','Bank Transfer','Other') NOT NULL,
  reference         VARCHAR(120) NULL,
  notes             VARCHAR(255) NULL,
  approved_by       INT UNSIGNED NULL,
  approved_at       DATETIME     NULL,
  status            ENUM('active','voided','reversed') NOT NULL DEFAULT 'active',
  status_reason     VARCHAR(255) NULL,
  created_by        INT UNSIGNED NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_refunds_booking (booking_id),
  CONSTRAINT fk_refunds_deposit  FOREIGN KEY (deposit_id)  REFERENCES deposits (id),
  CONSTRAINT fk_refunds_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id),
  CONSTRAINT fk_refunds_approver FOREIGN KEY (approved_by) REFERENCES users (id),
  CONSTRAINT fk_refunds_creator  FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expenses (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  expense_number  VARCHAR(20)  NOT NULL,
  spent_on        DATE         NOT NULL,
  category        ENUM('Fuel','Maintenance','Repairs','Cleaning','Insurance','Service','Advertising','Office','Other')
                  NOT NULL DEFAULT 'Other',
  description     VARCHAR(255) NULL,
  amount          DECIMAL(12,2) NOT NULL,
  vehicle_id      INT UNSIGNED NULL,
  booking_id      INT UNSIGNED NULL,
  vendor          VARCHAR(120) NULL,
  method          ENUM('Cash','UPI','Card','Bank Transfer','Other') NOT NULL DEFAULT 'Cash',
  corrects_id     INT UNSIGNED NULL,
  status          ENUM('active','voided','reversed') NOT NULL DEFAULT 'active',
  status_reason   VARCHAR(255) NULL,
  approval_state  ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  approved_by     INT UNSIGNED NULL,
  approved_at     DATETIME     NULL,
  verified_by     INT UNSIGNED NULL,
  verified_at     DATETIME     NULL,
  created_by      INT UNSIGNED NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_expense_number (expense_number),
  KEY ix_expenses_spent_on (spent_on),
  KEY ix_expenses_vehicle (vehicle_id),
  CONSTRAINT fk_expenses_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicles (id),
  CONSTRAINT fk_expenses_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id),
  CONSTRAINT fk_expenses_corrects FOREIGN KEY (corrects_id) REFERENCES expenses (id),
  CONSTRAINT fk_expenses_approver FOREIGN KEY (approved_by) REFERENCES users (id),
  CONSTRAINT fk_expenses_verifier FOREIGN KEY (verified_by) REFERENCES users (id),
  CONSTRAINT fk_expenses_creator  FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------- km --

-- Pickup and return readings, plus corrections. A correction never overwrites
-- the earlier reading; it appends a row citing what it corrects and why.
CREATE TABLE IF NOT EXISTS km_records (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id     INT UNSIGNED NOT NULL,
  leg            ENUM('pickup','return') NOT NULL,
  odometer_km    INT UNSIGNED NOT NULL,
  recorded_at    DATETIME     NOT NULL,
  fuel_level     ENUM('Full','3/4','1/2','1/4','Empty') NULL,
  condition_note VARCHAR(255) NULL,
  notes          VARCHAR(255) NULL,
  source         ENUM('manual','gps') NOT NULL DEFAULT 'manual',
  corrects_id    INT UNSIGNED NULL,
  correct_reason VARCHAR(255) NULL,
  status         ENUM('active','voided') NOT NULL DEFAULT 'active',
  approved_by    INT UNSIGNED NULL,
  approved_at    DATETIME     NULL,
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_km_booking_leg (booking_id, leg, status),
  CONSTRAINT fk_km_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id),
  CONSTRAINT fk_km_corrects FOREIGN KEY (corrects_id) REFERENCES km_records (id),
  CONSTRAINT fk_km_approver FOREIGN KEY (approved_by) REFERENCES users (id),
  CONSTRAINT fk_km_creator  FOREIGN KEY (created_by)  REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------- documents, approvals, audit --

-- Polymorphic, but deliberately constrained: a document must name the record
-- it belongs to. Receipts floating free of a transaction are worthless as
-- evidence.
CREATE TABLE IF NOT EXISTS documents (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_type    ENUM('payment','deposit','refund','expense','km_record','booking','vehicle','customer') NOT NULL,
  owner_id      INT UNSIGNED NOT NULL,
  kind          ENUM('receipt','proof','photo','licence','other') NOT NULL DEFAULT 'other',
  original_name VARCHAR(190) NOT NULL,
  stored_path   VARCHAR(255) NOT NULL,
  mime_type     VARCHAR(100) NOT NULL,
  size_bytes    INT UNSIGNED NOT NULL,
  sha256        CHAR(64)     NULL,
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_documents_owner (owner_type, owner_id),
  CONSTRAINT fk_documents_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approvals (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject_type  ENUM('payment','deposit','refund','expense','km_record','booking_charge') NOT NULL,
  subject_id    INT UNSIGNED NOT NULL,
  action        VARCHAR(60)  NOT NULL,
  state         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reason        VARCHAR(255) NULL,
  requested_by  INT UNSIGNED NULL,
  requested_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_by    INT UNSIGNED NULL,
  decided_at    DATETIME     NULL,
  decision_note VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY ix_approvals_subject (subject_type, subject_id),
  KEY ix_approvals_state (state),
  CONSTRAINT fk_approvals_requester FOREIGN KEY (requested_by) REFERENCES users (id),
  CONSTRAINT fk_approvals_decider   FOREIGN KEY (decided_by)   REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Written by the application on every mutation. Never updated or deleted.
CREATE TABLE IF NOT EXISTS audit_logs (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NULL,
  user_label     VARCHAR(120) NULL,
  action         VARCHAR(60)  NOT NULL,
  module         VARCHAR(40)  NOT NULL,
  record_type    VARCHAR(40)  NULL,
  record_id      INT UNSIGNED NULL,
  previous_value JSON         NULL,
  new_value      JSON         NULL,
  reason         VARCHAR(255) NULL,
  booking_id     INT UNSIGNED NULL,
  customer_id    INT UNSIGNED NULL,
  vehicle_id     INT UNSIGNED NULL,
  ip_address     VARBINARY(16) NULL,
  user_agent     VARCHAR(255) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_audit_created (created_at),
  KEY ix_audit_user (user_id),
  KEY ix_audit_record (record_type, record_id),
  KEY ix_audit_module (module),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sequential per-year document numbers (NSC-2026-0001 and friends), allocated
-- inside a transaction so two simultaneous saves cannot take the same number.
CREATE TABLE IF NOT EXISTS number_sequences (
  prefix     VARCHAR(12)  NOT NULL,
  year       SMALLINT UNSIGNED NOT NULL,
  last_value INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------- seed roles --

INSERT INTO roles (slug, name, description) VALUES
  ('super_admin', 'Super Admin', 'Full access, including user management'),
  ('admin',       'Admin',       'Bookings and day-to-day operations'),
  ('accounts',    'Accounts',    'Payments, deposits, expenses and financial reports'),
  ('auditor',     'Auditor',     'Read-only across records, reports and the audit log'),
  ('staff',       'Staff',       'Limited operational access')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
