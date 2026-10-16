-- The expense categories the form already offered, plus the car loan.
--
-- Two things at once, because they are the same mistake.
--
-- The form offered fifteen categories. The database allowed nine, and the API
-- validated against the same nine. Tyre, Parking, Toll, GPS, Driver and
-- Marketing were in the dropdown and refused on save -- so the one thing the
-- owner had to do to hit it was pick the category that actually described what
-- he had spent money on. This is the same drift vocab.php was written to stop
-- after body types did it, and the fix is the same: one list, read by the
-- form and by the validator, with this migration as the third declaration.
--
-- EMI is the new one. A car bought on finance costs a fixed sum every month
-- for years, and it was being filed under Other or not at all -- which makes
-- the monthly outgoing of the business unreadable from its own books. It sits
-- beside Insurance because they are the same kind of cost: what the car costs
-- to own, rather than what it costs to run.
ALTER TABLE expenses
  MODIFY COLUMN category ENUM(
    'Fuel','Service','Maintenance','Repairs','Tyre',
    'Insurance','EMI',
    'Cleaning','Parking','Toll','GPS','Driver',
    'Office','Marketing','Advertising','Other'
  ) NOT NULL DEFAULT 'Other';
