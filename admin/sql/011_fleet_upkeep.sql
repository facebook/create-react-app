-- What a car needs, and when.
--
-- The fleet list held what a car is -- make, model, reg, rate -- and nothing
-- about keeping it on the road. Insurance, the pollution certificate and the
-- fitness certificate all expire, a service falls due by distance or by date,
-- and every one of those is somebody remembering. They get remembered until
-- the day one does not, and that day the car is off the road or uninsured
-- with a customer in it.
--
-- Dates rather than a document store: what matters daily is the expiry, and a
-- date is what an alert can be built on. The certificates themselves upload
-- through the existing attachment machinery.

ALTER TABLE vehicles ADD COLUMN purchase_date DATE NULL AFTER model_year;
ALTER TABLE vehicles ADD COLUMN insurance_expiry DATE NULL AFTER purchase_date;
ALTER TABLE vehicles ADD COLUMN pollution_expiry DATE NULL AFTER insurance_expiry;
ALTER TABLE vehicles ADD COLUMN fitness_expiry DATE NULL AFTER pollution_expiry;

-- Service falls due on whichever comes first, so both are kept. Either may be
-- empty: a car serviced by distance alone has no date, and vice versa.
ALTER TABLE vehicles ADD COLUMN service_due_km INT UNSIGNED NULL AFTER fitness_expiry;
ALTER TABLE vehicles ADD COLUMN service_due_on DATE NULL AFTER service_due_km;

-- The trackers are from different suppliers, so the provider travels with the
-- device rather than being a setting for the whole fleet. A URL rather than an
-- API key: what is wanted today is a link that opens the provider's own page
-- for this car, and a key stored here would be a credential in a database that
-- does not need one.
ALTER TABLE vehicles ADD COLUMN gps_provider VARCHAR(60) NULL AFTER service_due_on;
ALTER TABLE vehicles ADD COLUMN gps_device_id VARCHAR(60) NULL AFTER gps_provider;
ALTER TABLE vehicles ADD COLUMN gps_url VARCHAR(255) NULL AFTER gps_device_id;

-- Every service, with what it cost and what it sets up next.
--
-- Separate from expenses, which records that money left the business. This
-- records what was done to a car and when the next one is due -- the same
-- event seen from the workshop rather than from the ledger. Saving one moves
-- the vehicle's service_due_km and service_due_on, so the alert has one source
-- rather than two that can disagree.
CREATE TABLE IF NOT EXISTS vehicle_services (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id      INT UNSIGNED NOT NULL,
  serviced_on     DATE         NOT NULL,
  odometer_km     INT UNSIGNED NOT NULL DEFAULT 0,
  service_type    VARCHAR(120) NOT NULL,
  amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  garage          VARCHAR(120) NULL,
  next_service_km INT UNSIGNED NULL,
  next_service_on DATE         NULL,
  note            TEXT         NULL,
  status          ENUM('active','voided') NOT NULL DEFAULT 'active',
  created_by      INT UNSIGNED NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_vehicle (vehicle_id, status, serviced_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
