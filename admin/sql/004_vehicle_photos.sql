-- A photograph per vehicle.
--
-- Only the filename is stored. The file itself lives under storage_path, which
-- is outside the document root -- the same reasoning as config.php: this host
-- rebuilds the web root from the repository on every deploy, so anything
-- uploaded into it would survive until the next push and no longer.
--
-- Nullable because most vehicles will not have one for a while, and a car with
-- no photograph still has to be listable.
ALTER TABLE vehicles
  ADD COLUMN photo_file VARCHAR(160) NULL AFTER colour;
