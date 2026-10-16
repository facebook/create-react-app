-- A one-off tidy-up: keep a few records, delete the rest, and renumber what
-- is left so the numbering starts at 1 again.
--
-- Run it in hPanel -> Databases -> phpMyAdmin -> SQL, as one paste. Take a
-- backup (Export) first: this deletes rows and nothing puts them back.
--
-- What to keep is the two lists directly below, and they are the only lines
-- meant to be edited. Everything after them works from those lists, so the
-- same script does the same job again later with different numbers in them.
--
-- What it does NOT delete:
--   * the audit trail -- it is the record of what happened, including to
--     records that no longer exist;
--   * expenses -- money that was spent was spent, so an expense attached to
--     a deleted booking keeps its amount and loses the link. The one line
--     that deletes them instead is marked below;
--   * customers -- left alone, and harmless: a customer with no bookings is
--     simply a name and a phone number. The line that clears the unused ones
--     is marked below too.
--
-- Uploaded files belonging to deleted bookings stay on the server. They are
-- outside the web root and reachable only through the booking that is gone,
-- so nothing serves them; they just take up a little space.

-- ------------------------------------------------------- look before --
--
-- Run this much on its own first. It changes nothing, and it shows exactly
-- which records the rest of the script would keep and which it would delete.
-- If that list is not what you expect, stop: fix the numbers above rather
-- than running the rest.
--
--   SELECT booking_number, status, start_at,
--          IF(booking_number IN ('NSC-2026-0006'), 'KEEP', 'delete') AS fate
--     FROM bookings ORDER BY booking_number;
--
--   SELECT enquiry_number, name, status,
--          IF(enquiry_number IN ('ENQ-2026-0004','ENQ-2026-0005'), 'KEEP', 'delete') AS fate
--     FROM enquiries ORDER BY enquiry_number;

-- ------------------------------------------------------------- the work --

START TRANSACTION;

-- ---------------------------------------------------------------- keep it --

-- Dropped first in case an earlier attempt in this same session left them
-- behind; a temporary table lives as long as the connection does.
DROP TEMPORARY TABLE IF EXISTS keep_bookings, keep_enquiries, drop_bookings, drop_enquiries;

CREATE TEMPORARY TABLE keep_bookings (id INT UNSIGNED PRIMARY KEY);
INSERT INTO keep_bookings
SELECT id FROM bookings WHERE booking_number IN ('NSC-2026-0006');

CREATE TEMPORARY TABLE keep_enquiries (id INT UNSIGNED PRIMARY KEY);
INSERT INTO keep_enquiries
SELECT id FROM enquiries WHERE enquiry_number IN ('ENQ-2026-0004', 'ENQ-2026-0005');

-- How many each list above should have found. If a number in it is wrong --
-- a typo, or a record already renumbered by an earlier run -- then that row
-- is not in the keep list, and without this it would be deleted along with
-- everything else. Every statement below asks @go first, so a list that does
-- not match these counts changes nothing at all.
SET @keep_bookings  := (SELECT COUNT(*) FROM keep_bookings);
SET @keep_enquiries := (SELECT COUNT(*) FROM keep_enquiries);
SET @go := (@keep_bookings = 1 AND @keep_enquiries = 2);

-- Worked out once, because a list that is read after the deletions have
-- started would already be out of date.
CREATE TEMPORARY TABLE drop_bookings (id INT UNSIGNED PRIMARY KEY);
INSERT INTO drop_bookings
SELECT id FROM bookings WHERE @go AND id NOT IN (SELECT id FROM keep_bookings);

CREATE TEMPORARY TABLE drop_enquiries (id INT UNSIGNED PRIMARY KEY);
INSERT INTO drop_enquiries
SELECT id FROM enquiries WHERE @go AND id NOT IN (SELECT id FROM keep_enquiries);

-- -------------------------------------------------- what hangs off a booking --
--
-- In this order because the database refuses to delete a booking while
-- anything still points at it.

-- The approvals and documents that belong to the money records going with it.
DELETE a FROM approvals a JOIN payments   p ON a.subject_type = 'payment'   AND a.subject_id = p.id
 WHERE p.booking_id IN (SELECT id FROM drop_bookings);
DELETE a FROM approvals a JOIN deposits   d ON a.subject_type = 'deposit'   AND a.subject_id = d.id
 WHERE d.booking_id IN (SELECT id FROM drop_bookings);
DELETE a FROM approvals a JOIN refunds    r ON a.subject_type = 'refund'    AND a.subject_id = r.id
 WHERE r.booking_id IN (SELECT id FROM drop_bookings);
DELETE a FROM approvals a JOIN km_records k ON a.subject_type = 'km_record' AND a.subject_id = k.id
 WHERE k.booking_id IN (SELECT id FROM drop_bookings);
DELETE a FROM approvals a JOIN booking_charges c ON a.subject_type = 'booking_charge' AND a.subject_id = c.id
 WHERE c.booking_id IN (SELECT id FROM drop_bookings);

DELETE FROM documents
 WHERE owner_type = 'booking' AND owner_id IN (SELECT id FROM drop_bookings);

-- Refunds before deposits: a refund names the deposit it came out of.
DELETE FROM refunds         WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM deposits        WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM payments        WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM km_records      WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM booking_extras  WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM booking_damages WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM booking_files   WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM booking_charges WHERE booking_id IN (SELECT id FROM drop_bookings);
DELETE FROM reminders       WHERE booking_id IN (SELECT id FROM drop_bookings);

-- The expense keeps its amount and loses the booking. To delete those
-- expenses instead, comment this line out and use the one under it.
UPDATE expenses SET booking_id = NULL WHERE booking_id IN (SELECT id FROM drop_bookings);
-- DELETE FROM expenses WHERE booking_id IN (SELECT id FROM drop_bookings);

-- An enquiry that is staying must stop pointing at a booking that is going.
UPDATE enquiries SET booking_id = NULL, status = 'Accepted'
 WHERE booking_id IN (SELECT id FROM drop_bookings);

DELETE FROM bookings WHERE id IN (SELECT id FROM drop_bookings);

-- ------------------------------------------------------------- enquiries --

DELETE FROM enquiries WHERE id IN (SELECT id FROM drop_enquiries);

-- ------------------------------------------------------------ renumbering --
--
-- Two passes. Going straight to the final number can collide with a number
-- another row still holds, and both are unique, so everything is parked on a
-- temporary value first.
--
-- 2026 is written in rather than taken from each row: the numbering runs per
-- year, and every record here is from this one. Run it again with the year
-- changed if that ever stops being true.

UPDATE bookings  SET booking_number = CONCAT('tmp-', id) WHERE @go;
UPDATE enquiries SET enquiry_number = CONCAT('tmp-', id) WHERE @go;

SET @n := 0;
UPDATE bookings
   SET booking_number = CONCAT('NSC-2026-', LPAD(@n := @n + 1, 4, '0'))
 WHERE @go
 ORDER BY created_at, id;

SET @n := 0;
UPDATE enquiries
   SET enquiry_number = CONCAT('ENQ-2026-', LPAD(@n := @n + 1, 4, '0'))
 WHERE @go
 ORDER BY created_at, id;

-- ---------------------------------------------------------- the counters --
--
-- What the panel issues next. Left alone, it would hand out a number that is
-- already on a record and the save would be refused. Written as an insert so
-- it also works on a counter that does not exist yet -- a panel that has
-- never issued one of these numbers has no row for it.
--
-- HAVING rather than WHERE for the guard: counting rows with no GROUP BY
-- answers with a row whether or not anything matched, so a WHERE that is
-- false here would not skip the statement -- it would set the counter to
-- zero, and the next booking would be handed a number already in use.

INSERT INTO number_sequences (prefix, year, last_value)
SELECT 'NSC', 2026, COUNT(*) FROM bookings HAVING @go
    ON DUPLICATE KEY UPDATE last_value = VALUES(last_value);

INSERT INTO number_sequences (prefix, year, last_value)
SELECT 'ENQ', 2026, COUNT(*) FROM enquiries HAVING @go
    ON DUPLICATE KEY UPDATE last_value = VALUES(last_value);

-- Payments and expenses keep their own numbers -- they can be written on a
-- receipt somebody is holding -- so their counters go to the highest still in
-- use rather than to a count.
INSERT INTO number_sequences (prefix, year, last_value)
SELECT 'PMT', 2026, COALESCE(MAX(CAST(SUBSTRING_INDEX(payment_number, '-', -1) AS UNSIGNED)), 0)
  FROM payments WHERE payment_number LIKE 'PMT-2026-%' HAVING @go
    ON DUPLICATE KEY UPDATE last_value = VALUES(last_value);

INSERT INTO number_sequences (prefix, year, last_value)
SELECT 'EXP', 2026, COALESCE(MAX(CAST(SUBSTRING_INDEX(expense_number, '-', -1) AS UNSIGNED)), 0)
  FROM expenses WHERE expense_number LIKE 'EXP-2026-%' HAVING @go
    ON DUPLICATE KEY UPDATE last_value = VALUES(last_value);

-- Optional: the customers nobody is booked under any more.
-- DELETE FROM customers WHERE id NOT IN (SELECT customer_id FROM bookings)
--   AND id NOT IN (SELECT customer_id FROM enquiries WHERE customer_id IS NOT NULL);

COMMIT;

-- ----------------------------------------------------------------- check --

SELECT IF(@go, 'Done.',
          CONCAT('STOPPED and nothing was changed: the lists at the top found ',
                 @keep_bookings, ' booking(s) and ', @keep_enquiries,
                 ' inquiry(s). Check the numbers are exactly as they appear in the panel.')) AS result;

SELECT booking_number, status, start_at FROM bookings ORDER BY booking_number;
SELECT enquiry_number, name, status, booking_id FROM enquiries ORDER BY enquiry_number;
SELECT prefix, year, last_value FROM number_sequences ORDER BY prefix;
