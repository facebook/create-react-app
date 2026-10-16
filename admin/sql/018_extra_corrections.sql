-- Correcting a charge raised after a booking was priced.
--
-- A charge for cleaning or fuel could be added and voided, and nothing else.
-- Fixing a figure typed wrongly therefore meant voiding the line and raising
-- a second one, which reads on the booking as two charges where there was
-- always only one -- and leaves anybody looking at it later to work out from
-- the timestamps that the first was a mistake rather than a separate job.
--
-- Corrected the way a deposit and an odometer reading already are: the wrong
-- row is marked voided with the reason it was wrong, and the replacement
-- cites it. The booking's total sums the active rows, so the figure follows
-- without anything else changing.
ALTER TABLE booking_extras ADD COLUMN corrects_id INT UNSIGNED NULL AFTER status;
ALTER TABLE booking_extras ADD COLUMN status_reason VARCHAR(255) NULL AFTER corrects_id;
