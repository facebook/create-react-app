-- The site's own images: the logo badge and the mark beside it.
--
-- One row per slot, holding a filename. The file itself lives under
-- storage_path like a vehicle photograph does, above the document root, so a
-- deploy cannot erase it.
--
-- A fixed set of slots rather than a free-for-all: these are specific places in
-- the page, and a name that does not correspond to one would be a file nobody
-- ever displays.
CREATE TABLE IF NOT EXISTS site_images (
  slot       VARCHAR(32)  NOT NULL,
  file       VARCHAR(160) NOT NULL,
  updated_by INT UNSIGNED NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
