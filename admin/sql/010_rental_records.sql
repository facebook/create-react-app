-- The records a self-drive business is asked for when something goes wrong.
--
-- What the panel already held was the commercial side: who, which car, when,
-- what it cost, what was paid. What it did not hold was the evidence -- the
-- licence that was checked, the state the car left in, what came back damaged,
-- and what was charged for it. Those are the things a dispute turns on, and
-- they were being kept on somebody's phone or not at all.

-- ---------------------------------------------------------------- customer --
--
-- A second number, because the one that answers a call is often not the one on
-- WhatsApp, and WhatsApp is how most of this business talks to its customers.
ALTER TABLE customers ADD COLUMN whatsapp VARCHAR(20) NULL AFTER phone;

-- A licence that expires during the hire is the renter's problem and the
-- owner's liability. Worth knowing before the keys change hands.
ALTER TABLE customers ADD COLUMN licence_expiry DATE NULL AFTER licence_number;

ALTER TABLE customers ADD COLUMN id_number VARCHAR(40) NULL AFTER licence_expiry;

ALTER TABLE customers
  ADD COLUMN customer_type ENUM('New','Returning','Corporate') NOT NULL DEFAULT 'New'
  AFTER id_number;

-- --------------------------------------------------------------- documents --
--
-- Against the customer rather than the booking. A returning customer's licence
-- is the same licence, and asking for it again every hire is how a file ends
-- up attached to three bookings and missing from the fourth.
--
-- Read back through the same signed-in-only reader the booking attachments
-- use: an identity document is the most private thing this system holds.
CREATE TABLE IF NOT EXISTS customer_files (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id INT UNSIGNED NOT NULL,
  kind        VARCHAR(24)  NOT NULL,
  file        VARCHAR(160) NOT NULL,
  caption     VARCHAR(160) NULL,
  expires_on  DATE         NULL,
  uploaded_by INT UNSIGNED NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_customer_kind (customer_id, kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------- charges --
--
-- Itemised rather than folded into other_charges, because "₹1,150 of other
-- charges" is not something a customer accepts and not something anyone can
-- explain a month later. Cleaning, fuel, a damage recharge and anything else
-- each keep their own line, their own amount and their own note.
--
-- Voided rather than deleted, like every other money row here: a charge that
-- was raised and dropped is part of the story.
CREATE TABLE IF NOT EXISTS booking_extras (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  kind       ENUM('cleaning','fuel','damage','late','other') NOT NULL DEFAULT 'other',
  amount     DECIMAL(12,2) NOT NULL,
  note       VARCHAR(255) NULL,
  status     ENUM('active','voided') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_extras_booking (booking_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ damage --
--
-- What was damaged and what it is thought to cost. Deliberately not money in
-- itself: an estimate is not a charge. Charging for it raises a booking_extras
-- line, and holding it back from the deposit is a refund deduction, and this
-- row is what both of those point at. One damage, one record, however it is
-- settled -- rather than an estimate in one place and a deduction in another
-- that nobody can tie together.
CREATE TABLE IF NOT EXISTS booking_damages (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id     INT UNSIGNED NOT NULL,
  description    VARCHAR(255) NOT NULL,
  estimated_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  noticed_at     ENUM('pickup','return') NOT NULL DEFAULT 'return',
  note           TEXT         NULL,
  status         ENUM('active','voided') NOT NULL DEFAULT 'active',
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_damages_booking (booking_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------- checklist --
--
-- The handover check, stored as JSON on the reading it belongs to rather than
-- as fourteen columns. The list of things worth checking changes -- a business
-- that starts hiring bikes wants a different one -- and a schema change per
-- item is how a checklist stops being maintained.
ALTER TABLE km_records ADD COLUMN checklist TEXT NULL AFTER condition_note;

-- What the customer said they would drive, against what they did. Useful
-- before the hire, for quoting; useful after it, for knowing whose estimates
-- to trust.
ALTER TABLE bookings ADD COLUMN estimated_km INT UNSIGNED NULL AFTER duration_days;
