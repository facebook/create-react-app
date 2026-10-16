-- Places worth driving to, for the tourist places page.
--
-- Content rather than code: the owner adds, edits and reorders these in the
-- panel. A hardcoded list would mean a deploy every time somewhere new opens,
-- and the glass bridge opening is exactly the case that would be missed.
--
-- The map link is a plain Google Maps search URL built from the name. Those
-- keep working when a place is renamed or moved, unlike the long share links
-- with session parameters in them, which rot.
CREATE TABLE IF NOT EXISTS places (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120)  NOT NULL,
  category   VARCHAR(60)   NOT NULL DEFAULT '',
  blurb      VARCHAR(400)  NOT NULL DEFAULT '',
  map_url    VARCHAR(500)  NOT NULL DEFAULT '',
  photo_file VARCHAR(160)  NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  published  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_places_order (published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeded so the page is useful the moment it exists. Every row is editable and
-- deletable in the panel; none of this is special.
INSERT INTO places (name, category, blurb, map_url, sort_order, published) VALUES
  ('Vivekananda Rock Memorial', 'Coast & sea', 'A sacred island monument built where Swami Vivekananda meditated. Reached by ferry from the shore.', 'https://www.google.com/maps/search/?api=1&query=Vivekananda%20Rock%20Memorial%2C%20Kanyakumari%2C%20Tamil%20Nadu', 1, 1),
  ('Thiruvalluvar Statue', 'Coast & sea', 'A 133-foot stone sculpture of the ancient Tamil poet, standing on its own islet beside the rock memorial.', 'https://www.google.com/maps/search/?api=1&query=Thiruvalluvar%20Statue%2C%20Kanyakumari%2C%20Tamil%20Nadu', 2, 1),
  ('Triveni Sangamam', 'Coast & sea', 'The meeting point of the Arabian Sea, the Bay of Bengal and the Indian Ocean.', 'https://www.google.com/maps/search/?api=1&query=Triveni%20Sangamam%2C%20Kanyakumari%2C%20Tamil%20Nadu', 3, 1),
  ('Kanyakumari Beach', 'Coast & sea', 'One of the few places in India where you can watch both sunrise and sunset over the sea.', 'https://www.google.com/maps/search/?api=1&query=Kanyakumari%20Beach%2C%20Kanyakumari%2C%20Tamil%20Nadu', 4, 1),
  ('Kanyakumari Lighthouse', 'Coast & sea', 'Wide panoramic views over the coastline and the offshore monuments.', 'https://www.google.com/maps/search/?api=1&query=Kanyakumari%20Lighthouse%2C%20Kanyakumari%2C%20Tamil%20Nadu', 5, 1),
  ('Kanyakumari Glass Bridge', 'Viewpoints', 'A recently opened glass walkway over the sea, linking the shore towards the monuments.', 'https://www.google.com/maps/search/?api=1&query=Kanyakumari%20Glass%20Bridge%2C%20Kanyakumari%2C%20Tamil%20Nadu', 6, 1),
  ('View Tower', 'Viewpoints', 'A helical pedestrian ramp giving an elevated 360-degree view of the coast.', 'https://www.google.com/maps/search/?api=1&query=View%20Tower%2C%20Kanyakumari%2C%20Tamil%20Nadu', 7, 1),
  ('Bhagavathy Amman Temple', 'Temples & heritage', 'An ancient seaside temple dedicated to the virgin goddess the town is named after.', 'https://www.google.com/maps/search/?api=1&query=Bhagavathy%20Amman%20Temple%2C%20Kanyakumari%2C%20Tamil%20Nadu', 8, 1),
  ('Mahatma Gandhi Mandapam', 'Temples & heritage', 'A pink memorial built on the spot where Gandhi''s ashes were kept before immersion.', 'https://www.google.com/maps/search/?api=1&query=Mahatma%20Gandhi%20Mandapam%2C%20Kanyakumari%2C%20Tamil%20Nadu', 9, 1),
  ('Our Lady of Ransom Church', 'Temples & heritage', 'A white Gothic church near the main beach, lit up at night.', 'https://www.google.com/maps/search/?api=1&query=Our%20Lady%20of%20Ransom%20Church%2C%20Kanyakumari%2C%20Tamil%20Nadu', 10, 1),
  ('Vattakottai Fort', 'Temples & heritage', 'An 18th-century granite fort on the shore, with ramparts you can walk.', 'https://www.google.com/maps/search/?api=1&query=Vattakottai%20Fort%2C%20Kanyakumari%2C%20Tamil%20Nadu', 11, 1),
  ('Suchindram Thanumalayan Temple', 'Temples & heritage', 'Known for its musical pillars and a Hanuman carved from a single rock.', 'https://www.google.com/maps/search/?api=1&query=Suchindram%20Thanumalayan%20Temple%2C%20Kanyakumari%2C%20Tamil%20Nadu', 12, 1),
  ('Padmanabhapuram Palace', 'Temples & heritage', 'A large wooden palace near Thuckalay, famous for its carved ceilings and cool stone floors.', 'https://www.google.com/maps/search/?api=1&query=Padmanabhapuram%20Palace%2C%20Kanyakumari%2C%20Tamil%20Nadu', 13, 1),
  ('Thirparappu Waterfalls', 'Waterfalls & hills', 'A 50-foot waterfall with a bathing pool below, at its best after the rains.', 'https://www.google.com/maps/search/?api=1&query=Thirparappu%20Waterfalls%2C%20Kanyakumari%2C%20Tamil%20Nadu', 14, 1),
  ('Mathoor Hanging Bridge', 'Waterfalls & hills', 'One of the tallest and longest aqueduct bridges in the country, crossing a wooded valley.', 'https://www.google.com/maps/search/?api=1&query=Mathoor%20Hanging%20Bridge%2C%20Kanyakumari%2C%20Tamil%20Nadu', 15, 1),
  ('Olakaruvi Waterfalls', 'Waterfalls & hills', 'A short forest trek to clear hill streams falling over the rocks.', 'https://www.google.com/maps/search/?api=1&query=Olakaruvi%20Waterfalls%2C%20Kanyakumari%2C%20Tamil%20Nadu', 16, 1),
  ('Kovalam Beach', 'Quieter beaches', 'An arc of golden sand a short drive from town, usually far quieter than the main beach.', 'https://www.google.com/maps/search/?api=1&query=Kovalam%20Beach%2C%20Kanyakumari%2C%20Tamil%20Nadu', 17, 1),
  ('Sanguthurai Beach', 'Quieter beaches', 'A clean, calm beach with white sand, known locally for its kite flying.', 'https://www.google.com/maps/search/?api=1&query=Sanguthurai%20Beach%2C%20Kanyakumari%2C%20Tamil%20Nadu', 18, 1),
  ('Muttom Beach', 'Quieter beaches', 'Dramatic rocky shore further up the coast, with a historic lighthouse above it.', 'https://www.google.com/maps/search/?api=1&query=Muttom%20Beach%2C%20Kanyakumari%2C%20Tamil%20Nadu', 19, 1);
