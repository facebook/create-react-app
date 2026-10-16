-- Where the work came from, what it was discounted by, and how it ended.
--
-- Three questions the panel could not answer. Which channel brings the
-- bookings, so money is spent where the customers actually are. Why an amount
-- is not the rate card amount, so a discount is a decision with a reason
-- rather than a number somebody typed. And what happened to a cancellation --
-- when, whose decision, what was kept and what went back.

-- How they found us. A short list rather than free text: the point is to count
-- them, and "instagram", "Insta" and "IG" do not add up.
ALTER TABLE bookings ADD COLUMN referral_source VARCHAR(24) NULL AFTER notes;

-- Cancellation, kept rather than deleted.
--
-- cancelled_reason already existed. What was missing was everything that makes
-- it a record: when, whose decision it was, and what the business kept. The
-- refund itself stays in the refunds table, where every other refund is.
ALTER TABLE bookings ADD COLUMN cancelled_at DATETIME NULL AFTER cancelled_reason;
ALTER TABLE bookings
  ADD COLUMN cancelled_by ENUM('customer','admin') NULL AFTER cancelled_at;

-- The wider list of things money goes on. Tyres, parking, tolls, the trackers
-- and the drivers were all landing in "Other", which is the same as not
-- recording them: a category everything falls into answers nothing.
ALTER TABLE expenses MODIFY COLUMN category
  ENUM('Fuel','Service','Maintenance','Repairs','Tyre','Insurance','Cleaning',
       'Parking','Toll','GPS','Driver','Office','Marketing','Advertising','Other')
  NOT NULL DEFAULT 'Other';
