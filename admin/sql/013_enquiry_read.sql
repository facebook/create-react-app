-- An enquiry that has been looked at, and who looked.
--
-- The sidebar badge used to count everything not yet resolved, which meant it
-- sat on "1" from the moment an enquiry arrived until somebody closed it out
-- days later. A number that is always on is a number nobody reads, and the
-- one morning it says 3 looks the same as every other morning.
--
-- Read and resolved are different questions. Status says where the enquiry
-- got to; this says whether anyone has seen it. The badge asks the second.
ALTER TABLE enquiries
  ADD COLUMN viewed_at DATETIME     NULL AFTER handled_at,
  ADD COLUMN viewed_by INT UNSIGNED NULL AFTER viewed_at;

ALTER TABLE enquiries
  ADD KEY ix_enquiries_unread (viewed_at),
  ADD CONSTRAINT fk_enquiries_viewer FOREIGN KEY (viewed_by) REFERENCES users (id);

-- Everything already dealt with counts as seen. Without this the badge would
-- light up with the whole history the first time the panel loads after the
-- update, which is exactly the noise this is meant to remove.
UPDATE enquiries SET viewed_at = COALESCE(handled_at, created_at)
 WHERE status <> 'New' AND viewed_at IS NULL;
