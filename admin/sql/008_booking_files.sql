-- Screenshots and photographs attached to a booking.
--
-- The panel has offered these boxes since the booking screens were built --
-- "Payment Screenshot / Receipt", "Deposit Proof", "Refund Proof", "Pickup
-- Photos", "Return Photos" -- and nothing was ever stored. There was no table
-- to put them in and no code reading the inputs, so a file chosen there was
-- discarded when the form submitted and the record saved without it.
--
-- One row per file. Kind says which box it came from, and ref_id ties a
-- payment screenshot to the payment it proves rather than to the booking in
-- general, so a booking with four payments does not end up with four
-- screenshots in a heap.
--
-- These are not like the site's other images. A vehicle photograph is an
-- advertisement; a payment screenshot carries a customer's name, their bank
-- and an amount, and a pickup photograph shows a registration plate. They are
-- stored above the document root like the rest and read back through a script
-- that requires a signed-in user, which the public readers deliberately do not.
CREATE TABLE IF NOT EXISTS booking_files (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id  INT UNSIGNED NOT NULL,
  kind        VARCHAR(24)  NOT NULL,
  ref_id      INT UNSIGNED NULL,
  file        VARCHAR(160) NOT NULL,
  caption     VARCHAR(160) NULL,
  uploaded_by INT UNSIGNED NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_kind (booking_id, kind),
  KEY idx_ref (kind, ref_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
