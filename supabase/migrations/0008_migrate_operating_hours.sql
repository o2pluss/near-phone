-- This migration ensures the hours column structure is correct
-- No migration needed as operating_hours column never existed in the database
-- The hours column is already properly structured

-- Add comment for documentation
COMMENT ON COLUMN public.stores.hours IS 'Store operating hours in format: weekday, saturday, sunday, holiday';
