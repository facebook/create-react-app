-- A car bought on finance, and the instalments it owes.
--
-- EMI became an expense category in 015, which made the cost recordable. It
-- did not make it automatic: the same figure had to be typed on the same day
-- every month for the length of the loan, and the month it was forgotten is
-- the month the books stop matching the bank.
--
-- So the loan is described once -- what it costs, which day it falls, when it
-- started and how many instalments there are -- and the expenses are written
-- from it.
CREATE TABLE IF NOT EXISTS vehicle_loans (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id    INT UNSIGNED NOT NULL,

  -- Written onto each expense as the vendor, so a generated row reads like a
  -- typed one: "paid to HDFC" rather than a blank where the payee goes.
  lender        VARCHAR(120) NULL,

  amount        DECIMAL(12,2) NOT NULL,

  -- Which day of the month it falls on. Kept separately from first_due_on
  -- because the two can disagree honestly: a loan whose first instalment was
  -- taken on the 3rd because that was the day the money cleared may still be
  -- due on the 5th every month after.
  --
  -- A day past the end of a short month is clamped to that month's last day
  -- when the dates are worked out. 31 means "the end of the month", which is
  -- what a bank means by it too.
  due_day       TINYINT UNSIGNED NOT NULL,

  first_due_on  DATE NOT NULL,

  -- How many there are in total, so the posting stops on its own. A loan that
  -- runs out and keeps writing expenses is worse than one that never started.
  instalments   SMALLINT UNSIGNED NOT NULL,

  method        ENUM('Cash','UPI','Card','Bank Transfer','Other') NOT NULL DEFAULT 'Bank Transfer',
  note          VARCHAR(255) NULL,

  -- Closed early: the car was sold, or the loan was settled. Set rather than
  -- deleted, because the instalments already posted are real money that was
  -- really paid and the loan is the only explanation of them.
  ended_on      DATE         NULL,

  created_by    INT UNSIGNED NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY ix_vehicle_loans_vehicle (vehicle_id),
  KEY ix_vehicle_loans_open (ended_on),
  CONSTRAINT fk_vehicle_loans_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Which loan an expense came from, and which instalment of it.
--
-- loan_seq is 1 for the first instalment, 2 for the second, and so on. The
-- unique key across the pair is the whole of why this can be run as often as
-- anyone likes: posting the same instalment twice is not a thing the code has
-- to be careful about, it is a thing the database refuses. Two people opening
-- the dashboard in the same second cannot produce two rows.
--
-- Both NULL on a typed expense, and the unique key ignores those -- MySQL
-- allows any number of rows where part of a unique key is NULL, which is
-- exactly the behaviour wanted here.
ALTER TABLE expenses
  ADD COLUMN loan_id INT UNSIGNED NULL AFTER booking_id;

ALTER TABLE expenses
  ADD COLUMN loan_seq SMALLINT UNSIGNED NULL AFTER loan_id;

ALTER TABLE expenses
  ADD UNIQUE KEY uq_expenses_loan_instalment (loan_id, loan_seq);

ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_loan FOREIGN KEY (loan_id) REFERENCES vehicle_loans (id);
