-- Editable page content.
--
-- Only overrides live here. Every section has a default committed in the site
-- repository (my-app/src/content/defaults.json), and a section with no row
-- falls back to it. That means this table starts empty and stays small, the
-- site still builds if the database is unreachable, and "reset to default" is
-- just deleting a row rather than restoring a copy.
--
-- data is the whole section as JSON rather than a row per field, because the
-- sections are not flat -- services and highlights are lists of items, and
-- highlights carry a list of bullet points inside each item.

CREATE TABLE IF NOT EXISTS content_sections (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  page       VARCHAR(40)  NOT NULL,
  section    VARCHAR(40)  NOT NULL,
  data       JSON         NOT NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_content_section (page, section),
  KEY ix_content_page (page),
  CONSTRAINT fk_content_user FOREIGN KEY (updated_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
