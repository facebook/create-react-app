-- The advertised daily price is a band, not one number.
--
-- A car goes out at 1,600 midweek and 1,800 in season, and the card on the
-- site should say so rather than naming one figure and surprising people.
--
-- rate_daily keeps its meaning exactly: it is the figure a booking is charged
-- at, copied into booking_charges and multiplied by the number of days. A
-- range cannot be multiplied, so this is a second column and not a widening of
-- the first. It is display-only, and every calculation ignores it.
--
-- Nullable, because most vehicles have a flat rate and should keep showing one
-- price.
ALTER TABLE vehicle_rates
  ADD COLUMN rate_daily_max DECIMAL(12,2) NULL AFTER rate_daily;
