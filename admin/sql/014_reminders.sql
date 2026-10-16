-- Reminders somebody sets themselves.
--
-- The bell already carries what the system works out on its own -- a return
-- due back, a balance nobody has collected, insurance about to lapse. None of
-- that covers "call Prasanth on Friday" or "the insurance agent is coming
-- Tuesday", which is the half of the job that lives on a phone's notes app
-- and gets forgotten when the phone is in a pocket.
--
-- Shared rather than private. In a business this size the person at the desk
-- is not always the person who set the reminder, and a reminder only that
-- person can see is one nobody acts on while they are out with a customer.
-- Who set it is recorded, so it is still answerable.
CREATE TABLE IF NOT EXISTS reminders (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(190) NOT NULL,
  note        TEXT         NULL,
  due_on      DATE         NOT NULL,
  -- Optional. Most reminders are "some time that day"; a few are "9am, at the
  -- handover", and forcing a time on the first kind makes every one of them a
  -- small lie about when it is due.
  due_at      TIME         NULL,
  -- What it is about, when it is about something. A reminder attached to a
  -- booking opens that booking, the same as every other line in the bell.
  booking_id  INT UNSIGNED NULL,
  vehicle_id  INT UNSIGNED NULL,
  done_at     DATETIME     NULL,
  done_by     INT UNSIGNED NULL,
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- The list is always "what is still open, soonest first", so that is what
  -- the index is for.
  KEY ix_reminders_open (done_at, due_on),
  KEY ix_reminders_booking (booking_id),
  KEY ix_reminders_vehicle (vehicle_id),
  CONSTRAINT fk_reminders_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
  CONSTRAINT fk_reminders_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
  CONSTRAINT fk_reminders_creator FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT fk_reminders_closer  FOREIGN KEY (done_by)    REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
