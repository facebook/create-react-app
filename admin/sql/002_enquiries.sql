-- Enquiry additions.
--
-- The public form is the only unauthenticated entry point in the system, so
-- each submission records where it came from. That is what makes rate
-- limiting possible, and what lets a flood be traced afterwards.

ALTER TABLE enquiries
  ADD COLUMN admin_notes  TEXT          NULL AFTER requirements,
  ADD COLUMN ip_address   VARBINARY(16) NULL AFTER source,
  ADD COLUMN user_agent   VARCHAR(255)  NULL AFTER ip_address,
  ADD COLUMN handled_by   INT UNSIGNED  NULL AFTER status,
  ADD COLUMN handled_at   DATETIME      NULL AFTER handled_by,
  ADD COLUMN booking_id   INT UNSIGNED  NULL AFTER handled_at,
  ADD KEY ix_enquiries_created (created_at),
  ADD KEY ix_enquiries_ip (ip_address, created_at),
  ADD CONSTRAINT fk_enquiries_handler FOREIGN KEY (handled_by) REFERENCES users (id),
  ADD CONSTRAINT fk_enquiries_booking FOREIGN KEY (booking_id) REFERENCES bookings (id);
