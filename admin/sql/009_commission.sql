-- Cars that are not ours, and what we keep for hiring them out.
--
-- The business does two things that the schema only described one of. Most
-- bookings are our own car, where the whole rental is ours. Some are somebody
-- else's car, sourced for a customer -- and there the rental is mostly passed
-- to the car's owner, and what the business earns is a commission on it.
--
-- Recording those the same way overstated revenue by the whole rental every
-- time, which is the kind of error that only shows up when the money does not
-- match the bank.
--
-- ownership says whose car it is. owner_name and owner_phone are who to call
-- and who to pay. is_temporary marks one brought in for a hire or two rather
-- than a car the fleet now has, so it can be found and retired afterwards
-- instead of sitting in the list forever.
ALTER TABLE vehicles
  ADD COLUMN ownership ENUM('own','partner') NOT NULL DEFAULT 'own' AFTER status;

ALTER TABLE vehicles
  ADD COLUMN owner_name VARCHAR(120) NULL AFTER ownership;

ALTER TABLE vehicles
  ADD COLUMN owner_phone VARCHAR(20) NULL AFTER owner_name;

ALTER TABLE vehicles
  ADD COLUMN is_temporary TINYINT(1) NOT NULL DEFAULT 0 AFTER owner_phone;

-- The commission belongs with the rest of the frozen commercial terms rather
-- than on the booking, for the same reason the rental does: what was agreed
-- when the booking was made must still be readable after the arrangement with
-- that owner changes.
ALTER TABLE booking_charges
  ADD COLUMN commission DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER discount;

-- When the rest of the money is expected. A monthly hire is commonly half at
-- the start and the balance a few days later, and without a date the second
-- half is only remembered by whoever took the booking.
ALTER TABLE bookings
  ADD COLUMN balance_due_on DATE NULL AFTER return_at;
